"""
Utility helpers for the Online Banking Portal.
Provides formatting, validation, and ID generation functions.
"""

import random
import string
from datetime import datetime


def generate_account_number(user_id: int) -> str:
    """Generate a unique account number based on user ID."""
    return f"OBPK{user_id:07d}"


def generate_transaction_id() -> str:
    """Generate a unique transaction ID."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = "".join(random.choices(string.digits, k=4))
    return f"TXN{timestamp}{random_suffix}"


def format_currency(amount: float) -> str:
    """Format amount as Indian Rupees with proper grouping."""
    neg = amount < 0
    amount = abs(amount)
    s = f"{amount:,.2f}"
    return f"-₹{s}" if neg else f"₹{s}"


def format_date(dt_str: str) -> str:
    """Format a datetime string for display."""
    if not dt_str:
        return "N/A"
    try:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
        return dt.strftime("%d %b %Y, %I:%M %p")
    except (ValueError, TypeError):
        try:
            dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S.%f")
            return dt.strftime("%d %b %Y, %I:%M %p")
        except (ValueError, TypeError):
            return dt_str


def format_short_date(dt_str: str) -> str:
    """Format a datetime string in short format."""
    if not dt_str:
        return "N/A"
    try:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
        return dt.strftime("%d %b %Y")
    except (ValueError, TypeError):
        return dt_str


def validate_amount(amount_str: str) -> tuple:
    """Validate an amount string. Returns (is_valid, amount_or_error_msg)."""
    try:
        amount = float(amount_str)
    except (ValueError, TypeError):
        return False, "Please enter a valid numeric amount."
    if amount <= 0:
        return False, "Amount must be greater than zero."
    if amount > 9999999:
        return False, "Amount exceeds maximum allowed limit."
    rounded = round(amount, 2)
    return True, rounded


def get_initials(full_name: str) -> str:
    """Get initials from a full name."""
    parts = full_name.strip().split()
    if not parts:
        return "?"
    if len(parts) == 1:
        return parts[0][0].upper()
    return (parts[0][0] + parts[-1][0]).upper()


def mask_account_number(acc_num: str) -> str:
    """Mask an account number for display."""
    if len(acc_num) <= 4:
        return acc_num
    return f"****{acc_num[-4:]}"


def time_ago(dt_str: str) -> str:
    """Return a human-readable 'time ago' string."""
    if not dt_str:
        return "N/A"
    try:
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
    except (ValueError, TypeError):
        return dt_str
    diff = datetime.now() - dt
    seconds = diff.total_seconds()
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        return f"{int(seconds // 60)} min ago"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} hr ago"
    elif seconds < 604800:
        return f"{int(seconds // 86400)} day{'s' if seconds >= 172800 else ''} ago"
    else:
        return dt.strftime("%d %b %Y")
