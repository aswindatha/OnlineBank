"""Notification model dataclass."""

from dataclasses import dataclass


@dataclass
class Notification:
    id: int = 0
    user_id: int = 0
    title: str = ""
    message: str = ""
    category: str = "info"
    is_read: int = 0
    created_at: str = ""

    @classmethod
    def from_row(cls, row):
        if row is None:
            return None
        return cls(
            id=row["id"],
            user_id=row["user_id"],
            title=row["title"],
            message=row["message"],
            category=row["category"],
            is_read=row["is_read"],
            created_at=row["created_at"],
        )
