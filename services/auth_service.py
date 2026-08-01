"""
Authentication service: login, registration, forgot password, login history.
"""

from datetime import datetime
from database.db import get_connection
from models.user import User
from utils.helpers import generate_account_number


def login(username: str, password: str):
    """Attempt login. Returns (user, error_message)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (username, password),
    )
    row = cursor.fetchone()
    if row is None:
        # Record failed login attempt if user exists
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        existing = cursor.fetchone()
        if existing:
            cursor.execute(
                "INSERT INTO login_history (user_id, status) VALUES (?, 'Failed')",
                (existing["id"],),
            )
            conn.commit()
        conn.close()
        return None, "Invalid username or password."

    if row["is_active"] == 0:
        conn.close()
        return None, "Your account has been deactivated. Please contact the administrator."

    # Update last login
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        "UPDATE users SET last_login = ? WHERE id = ?",
        (now, row["id"]),
    )
    cursor.execute(
        "INSERT INTO login_history (user_id, status) VALUES (?, 'Success')",
        (row["id"],),
    )
    conn.commit()
    user = User.from_row(row)
    user.last_login = now
    conn.close()
    return user, None


def register(username: str, password: str, full_name: str, email: str,
             phone: str, address: str, account_type: str):
    """Register a new user. Returns (user, error_message)."""
    conn = get_connection()
    cursor = conn.cursor()

    # Check if username exists
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        conn.close()
        return None, "Username already exists. Please choose another."

    # Insert user
    cursor.execute(
        "INSERT INTO users (username, password, full_name, email, phone, address, role) "
        "VALUES (?, ?, ?, ?, ?, ?, 'user')",
        (username, password, full_name, email, phone, address),
    )
    user_id = cursor.lastrowid

    # Create account
    acc_num = generate_account_number(user_id)
    cursor.execute(
        "INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES (?, ?, ?, 0.0)",
        (user_id, acc_num, account_type),
    )

    # Welcome notification
    cursor.execute(
        "INSERT INTO notifications (user_id, title, message, category) VALUES (?, ?, ?, ?)",
        (user_id, "Welcome to OnlineBank!", f"Your {account_type} account has been created successfully. Account No: {acc_num}", "success"),
    )

    conn.commit()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = User.from_row(cursor.fetchone())
    conn.close()
    return user, None


def forgot_password(username: str, email: str):
    """Simulate forgot password. Returns (new_password, error_message)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username = ? AND email = ?",
        (username, email),
    )
    row = cursor.fetchone()
    if row is None:
        conn.close()
        return None, "No account found with that username and email combination."

    # Simulate password reset - set a temporary password
    temp_password = "reset123"
    cursor.execute(
        "UPDATE users SET password = ? WHERE id = ?",
        (temp_password, row["id"]),
    )
    conn.commit()
    conn.close()
    return temp_password, None


def get_login_history(user_id: int, limit: int = 10):
    """Get recent login history for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM login_history WHERE user_id = ? ORDER BY login_time DESC LIMIT ?",
        (user_id, limit),
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
