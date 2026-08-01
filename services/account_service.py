"""
Account service: profile management, account summary, password changes.
"""

from database.db import get_connection
from models.account import Account


def get_account(user_id: int):
    """Get account details for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM accounts WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return Account.from_row(row) if row else None


def get_account_dict(user_id: int) -> dict:
    """Get account details as a dictionary."""
    acc = get_account(user_id)
    if acc:
        return {
            "account_number": acc.account_number,
            "account_type": acc.account_type,
            "balance": acc.balance,
            "branch": acc.branch,
            "ifsc": acc.ifsc,
            "status": acc.status,
            "created_at": acc.created_at,
        }
    return {}


def get_balance(user_id: int) -> float:
    """Get current balance for a user."""
    acc = get_account(user_id)
    return acc.balance if acc else 0.0


def update_profile(user_id: int, full_name: str, email: str, phone: str, address: str):
    """Update user profile. Returns (success, error_message)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET full_name = ?, email = ?, phone = ?, address = ? WHERE id = ?",
        (full_name, email, phone, address, user_id),
    )
    conn.commit()
    conn.close()
    return True, None


def change_password(user_id: int, old_password: str, new_password: str):
    """Change user password. Returns (success, error_message)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    if row is None:
        conn.close()
        return False, "User not found."
    if row["password"] != old_password:
        conn.close()
        return False, "Current password is incorrect."
    if len(new_password) < 4:
        conn.close()
        return False, "New password must be at least 4 characters long."
    cursor.execute("UPDATE users SET password = ? WHERE id = ?", (new_password, user_id))
    conn.commit()
    conn.close()
    return True, None


def get_user_by_id(user_id: int):
    """Get user by ID."""
    from models.user import User
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return User.from_row(row) if row else None


def get_all_users(active_only: bool = False):
    """Get all users (for admin and transfer). Pass active_only=True to exclude deactivated accounts."""
    conn = get_connection()
    cursor = conn.cursor()
    if active_only:
        cursor.execute("SELECT * FROM users WHERE role = 'user' AND is_active = 1 ORDER BY id")
    else:
        cursor.execute("SELECT * FROM users WHERE role = 'user' ORDER BY id")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_avatar_color(user_id: int, color_hex: str):
    """Update the avatar background color for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET avatar_color = ? WHERE id = ?", (color_hex, user_id))
    conn.commit()
    conn.close()
