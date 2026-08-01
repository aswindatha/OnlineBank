"""Account model dataclass."""

from dataclasses import dataclass
from typing import Optional


@dataclass
class Account:
    id: int = 0
    user_id: int = 0
    account_number: str = ""
    account_type: str = "Savings"
    balance: float = 0.0
    branch: str = "Main Branch"
    ifsc: str = "OBPK0000001"
    status: str = "Active"
    created_at: str = ""

    @classmethod
    def from_row(cls, row):
        if row is None:
            return None
        return cls(
            id=row["id"],
            user_id=row["user_id"],
            account_number=row["account_number"],
            account_type=row["account_type"],
            balance=row["balance"],
            branch=row["branch"] if "branch" in row.keys() else "Main Branch",
            ifsc=row["ifsc"] if "ifsc" in row.keys() else "OBPK0000001",
            status=row["status"] if "status" in row.keys() else "Active",
            created_at=row["created_at"],
        )
