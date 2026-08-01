"""
Notification service: create, list, mark as read.
"""

from database.db import get_connection


def create_notification(user_id: int, title: str, message: str, category: str = "info"):
    """Create a new notification for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO notifications (user_id, title, message, category) VALUES (?, ?, ?, ?)",
        (user_id, title, message, category),
    )
    conn.commit()
    conn.close()


def get_notifications(user_id: int, limit: int = 50, unread_only: bool = False):
    """Get notifications for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    if unread_only:
        cursor.execute(
            "SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        )
    else:
        cursor.execute(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (user_id, limit),
        )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_unread_count(user_id: int) -> int:
    """Get count of unread notifications."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0",
        (user_id,),
    )
    count = cursor.fetchone()["cnt"]
    conn.close()
    return count


def mark_as_read(notification_id: int):
    """Mark a single notification as read."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ?", (notification_id,))
    conn.commit()
    conn.close()


def mark_all_read(user_id: int):
    """Mark all notifications as read for a user."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()
