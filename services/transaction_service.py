"""
Transaction service: deposit, withdraw, transfer, transaction history.
"""

from datetime import datetime
from database.db import get_connection
from utils.helpers import generate_transaction_id
from services.notification_service import create_notification


def deposit(user_id: int, amount: float, description: str = "Cash Deposit"):
    """Deposit amount into user's account. Returns (success, error_message, receipt_dict)."""
    if amount <= 0:
        return False, "Amount must be greater than zero.", None

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT balance FROM accounts WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if row is None:
            return False, "Account not found.", None

        new_balance = row["balance"] + amount
        tx_id = generate_transaction_id()
        cursor.execute(
            "UPDATE accounts SET balance = ? WHERE user_id = ?",
            (new_balance, user_id),
        )
        cursor.execute(
            "INSERT INTO transactions (transaction_id, user_id, type, amount, description, balance_after, status) "
            "VALUES (?, ?, 'Deposit', ?, ?, ?, 'Success')",
            (tx_id, user_id, amount, description, new_balance),
        )
        conn.commit()
        create_notification(
            user_id, "Deposit Successful",
            f"Rs. {amount:,.2f} has been credited to your account. Balance: Rs. {new_balance:,.2f}",
            "success",
        )
        return True, None, {"transaction_id": tx_id, "balance": new_balance}
    except Exception as e:
        conn.rollback()
        return False, str(e), None
    finally:
        conn.close()


def withdraw(user_id: int, amount: float, description: str = "Cash Withdrawal"):
    """Withdraw amount from user's account. Returns (success, error_message, receipt_dict)."""
    if amount <= 0:
        return False, "Amount must be greater than zero.", None

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT balance FROM accounts WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if row is None:
            return False, "Account not found.", None

        current_balance = row["balance"]
        if amount > current_balance:
            return False, "Insufficient balance for this withdrawal.", None

        new_balance = current_balance - amount
        tx_id = generate_transaction_id()
        cursor.execute(
            "UPDATE accounts SET balance = ? WHERE user_id = ?",
            (new_balance, user_id),
        )
        cursor.execute(
            "INSERT INTO transactions (transaction_id, user_id, type, amount, description, balance_after, status) "
            "VALUES (?, ?, 'Withdraw', ?, ?, ?, 'Success')",
            (tx_id, user_id, amount, description, new_balance),
        )
        conn.commit()
        create_notification(
            user_id, "Withdrawal Successful",
            f"Rs. {amount:,.2f} has been debited from your account. Balance: Rs. {new_balance:,.2f}",
            "warning",
        )
        return True, None, {"transaction_id": tx_id, "balance": new_balance}
    except Exception as e:
        conn.rollback()
        return False, str(e), None
    finally:
        conn.close()


def transfer(sender_id: int, receiver_id: int, amount: float, remarks: str = "Fund Transfer"):
    """Transfer funds between two users. Returns (success, error_message, receipt_dict)."""
    if amount <= 0:
        return False, "Amount must be greater than zero.", None
    if sender_id == receiver_id:
        return False, "Cannot transfer to your own account.", None

    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Get sender balance
        cursor.execute("SELECT balance FROM accounts WHERE user_id = ?", (sender_id,))
        sender_row = cursor.fetchone()
        if sender_row is None:
            return False, "Sender account not found.", None
        sender_balance = sender_row["balance"]
        if amount > sender_balance:
            return False, "Insufficient balance for this transfer.", None

        # Get receiver
        cursor.execute("SELECT balance FROM accounts WHERE user_id = ?", (receiver_id,))
        receiver_row = cursor.fetchone()
        if receiver_row is None:
            return False, "Receiver account not found.", None

        receiver_balance = receiver_row["balance"]
        new_sender_balance = sender_balance - amount
        new_receiver_balance = receiver_balance + amount
        tx_id = generate_transaction_id()

        # Update balances
        cursor.execute("UPDATE accounts SET balance = ? WHERE user_id = ?", (new_sender_balance, sender_id))
        cursor.execute("UPDATE accounts SET balance = ? WHERE user_id = ?", (new_receiver_balance, receiver_id))

        # Create transaction record for sender
        cursor.execute(
            "INSERT INTO transactions (transaction_id, user_id, type, amount, description, receiver_id, balance_after, status) "
            "VALUES (?, ?, 'Transfer', ?, ?, ?, ?, 'Success')",
            (tx_id, sender_id, amount, f"Transfer to user #{receiver_id}: {remarks}", receiver_id, new_sender_balance),
        )

        # Create transaction record for receiver
        tx_id2 = generate_transaction_id()
        cursor.execute(
            "INSERT INTO transactions (transaction_id, user_id, type, amount, description, receiver_id, balance_after, status) "
            "VALUES (?, ?, 'Transfer', ?, ?, ?, ?, 'Success')",
            (tx_id2, receiver_id, amount, f"Transfer from user #{sender_id}: {remarks}", sender_id, new_receiver_balance),
        )

        conn.commit()

        # Notifications
        create_notification(
            sender_id, "Transfer Sent",
            f"Rs. {amount:,.2f} transferred to user #{receiver_id}. Balance: Rs. {new_sender_balance:,.2f}",
            "info",
        )
        create_notification(
            receiver_id, "Transfer Received",
            f"Rs. {amount:,.2f} received from user #{sender_id}. Balance: Rs. {new_receiver_balance:,.2f}",
            "success",
        )
        return True, None, {"transaction_id": tx_id, "balance": new_sender_balance}
    except Exception as e:
        conn.rollback()
        return False, str(e), None
    finally:
        conn.close()


def get_transactions(user_id: int, limit: int = None, offset: int = 0,
                     tx_type: str = None, search: str = None):
    """Get transactions for a user with optional filtering."""
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM transactions WHERE user_id = ?"
    params = [user_id]

    if tx_type and tx_type != "All":
        query += " AND type = ?"
        params.append(tx_type)

    if search:
        query += " AND (description LIKE ? OR transaction_id LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    query += " ORDER BY created_at DESC"

    if limit:
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_mini_statement(user_id: int, limit: int = 10):
    """Get last N transactions for mini statement."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
        (user_id, limit),
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_transaction_stats(user_id: int):
    """Get transaction statistics for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    stats = {"total_deposit": 0, "total_withdraw": 0, "total_transfer": 0, "count": 0}

    cursor.execute(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'Deposit'",
        (user_id,),
    )
    stats["total_deposit"] = cursor.fetchone()["total"]

    cursor.execute(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'Withdraw'",
        (user_id,),
    )
    stats["total_withdraw"] = cursor.fetchone()["total"]

    cursor.execute(
        "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'Transfer'",
        (user_id,),
    )
    stats["total_transfer"] = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as cnt FROM transactions WHERE user_id = ?", (user_id,))
    stats["count"] = cursor.fetchone()["cnt"]

    conn.close()
    return stats


def get_recent_recipients(user_id: int, limit: int = 3):
    """Get the most recent distinct users this user has sent transfers to."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT receiver_id, MAX(created_at) as last_time
        FROM transactions
        WHERE user_id = ? AND type = 'Transfer' AND receiver_id IS NOT NULL
        GROUP BY receiver_id
        ORDER BY last_time DESC
        LIMIT ?
        """,
        (user_id, limit),
    )
    receiver_ids = [r["receiver_id"] for r in cursor.fetchall()]
    recipients = []
    for rid in receiver_ids:
        cursor.execute("SELECT id, full_name, username FROM users WHERE id = ?", (rid,))
        row = cursor.fetchone()
        if row:
            recipients.append(dict(row))
    conn.close()
    return recipients


def get_monthly_activity(user_id: int, months: int = 6):
    """Get monthly transaction activity for charts."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT substr(created_at, 1, 7) as month,
               type,
               COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE user_id = ?
          AND created_at >= date('now', '-' || ? || ' months')
        GROUP BY month, type
        ORDER BY month
        """,
        (user_id, months),
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
