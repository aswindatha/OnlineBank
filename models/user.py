"""User model dataclass."""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class User:
    id: int = 0
    username: str = ""
    password: str = ""
    full_name: str = ""
    email: str = ""
    phone: str = ""
    address: str = ""
    role: str = "user"
    is_active: int = 1
    created_at: str = ""
    last_login: Optional[str] = None
    avatar_color: str = "#1a237e"

    @classmethod
    def from_row(cls, row):
        if row is None:
            return None
        return cls(
            id=row["id"],
            username=row["username"],
            password=row["password"],
            full_name=row["full_name"],
            email=row["email"] if "email" in row.keys() else "",
            phone=row["phone"] if "phone" in row.keys() else "",
            address=row["address"] if "address" in row.keys() else "",
            role=row["role"],
            is_active=row["is_active"],
            created_at=row["created_at"],
            last_login=row["last_login"],
            avatar_color=row["avatar_color"] if "avatar_color" in row.keys() else "#1a237e",
        )
