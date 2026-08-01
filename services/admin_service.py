"""
Admin service: user management, admin dashboard statistics.
"""

from database.db import get_connection
from utils.helpers import generate_account_number
from services.notification_service import create_notification


def get_admin_stats():
    """Get dashboard statistics for admin."""
    conn = get_connection()
    cursor = conn.cursor()
    stats = {}

    cursor.execute("SELECT COUNT(*) as cnt FROM users WHERE role = 'user'")
    stats["total_users"] = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM users WHERE role = 'user' AND is_active = 1")
    stats["active_users"] = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'Deposit'")
    stats["total_deposits"] = cursor.fetchone()["total"]

    cursor.execute("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'Withdraw'")
    stats["total_withdrawals"] = cursor.fetchone()["total"]

    cursor.execute("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'Transfer'")
    stats["total_transfers"] = cursor.fetchone()["total"]

    cursor.execute("SELECT COALESCE(SUM(balance), 0) as total FROM accounts")
    stats["total_balance"] = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as cnt FROM transactions")
    stats["total_transactions"] = cursor.fetchone()["cnt"]

    conn.close()
    return stats


def get_all_users():
    """Get all users with account info."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT u.id, u.username, u.full_name, u.email, u.phone, u.role,
               u.is_active, u.created_at, u.last_login,
               a.account_number, a.account_type, a.balance
        FROM users u
        LEFT JOIN accounts a ON u.id = a.user_id
        WHERE u.role = 'user'
        ORDER BY u.id
        """,
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def add_user(username: str, password: str, full_name: str, email: str,
             phone: str, address: str, account_type: str, initial_balance: float = 0.0):
    """Add a new user from admin panel. Returns (success, error_message)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        conn.close()
        return False, "Username already exists."

    cursor.execute(
        "INSERT INTO users (username, password, full_name, email, phone, address, role) "
        "VALUES (?, ?, ?, ?, ?, ?, 'user')",
        (username, password, full_name, email, phone, address),
    )
    user_id = cursor.lastrowid
    acc_num = generate_account_number(user_id)
    cursor.execute(
        "INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES (?, ?, ?, ?)",
        (user_id, acc_num, account_type, initial_balance),
    )
    create_notification(
        user_id, "Account Created",
        f"Your account has been created by admin. Account No: {acc_num}",
        "success",
    )
    conn.commit()
    conn.close()
    return True, None


def update_user(user_id: int, full_name: str, email: str, phone: str, address: str):
    """Update user details from admin panel."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET full_name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
        (full_name, email, phone, address, user_id),
    )
    conn.commit()
    conn.close()


def delete_user(user_id: int):
    """Delete a user and their account."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM transactions WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM accounts WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM login_history WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()


def toggle_user_status(user_id: int, activate: bool):
    """Activate or deactivate a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET is_active = ? WHERE id = ?", (1 if activate else 0, user_id))
    cursor.execute("UPDATE accounts SET status = ? WHERE user_id = ?", ("Active" if activate else "Inactive", user_id))
    conn.commit()
    conn.close()


def get_all_transactions(limit: int = 100, tx_type: str = None, search: str = None,
                         date_from: str = None, date_to: str = None):
    """Get all transactions (admin view)."""
    conn = get_connection()
    cursor = conn.cursor()
    query = """
        SELECT t.*, u.username, u.full_name,
               r.username as receiver_username,
               a.account_number
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN users r ON t.receiver_id = r.id
        LEFT JOIN accounts a ON t.user_id = a.user_id
    """
    params = []
    conditions = []
    if tx_type and tx_type != "All":
        conditions.append("t.type = ?")
        params.append(tx_type)
    if search:
        conditions.append("(t.description LIKE ? OR t.transaction_id LIKE ? OR u.username LIKE ? OR u.full_name LIKE ? OR a.account_number LIKE ?)")
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%", f"%{search}%", f"%{search}%"])
    if date_from:
        conditions.append("date(t.created_at) >= date(?)")
        params.append(date_from)
    if date_to:
        conditions.append("date(t.created_at) <= date(?)")
        params.append(date_to)
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY t.created_at DESC LIMIT ?"
    params.append(limit)
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_admin_monthly_activity(months: int = 6):
    """Get monthly activity for admin charts."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT substr(created_at, 1, 7) as month,
               type,
               COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE created_at >= date('now', '-' || ? || ' months')
        GROUP BY month, type
        ORDER BY month
        """,
        (months,),
    )
    rows = cursor.fetchall()
    conn.close()
    monthly = {}
    for r in rows:
        month = r["month"]
        if month not in monthly:
            monthly[month] = {"Deposit": 0, "Withdraw": 0, "Transfer": 0}
        monthly[month][r["type"]] = r["total"]
    return monthly


def get_recent_activity(limit: int = 10):
    """Get recent transactions for admin dashboard."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT t.*, u.username, u.full_name
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC LIMIT ?
        """,
        (limit,),
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
