"""Transaction model dataclass."""

from dataclasses import dataclass
from typing import Optional


@dataclass
class Transaction:
    id: int = 0
    transaction_id: str = ""
    user_id: int = 0
    type: str = ""
    amount: float = 0.0
    description: str = ""
    receiver_id: Optional[int] = None
    balance_after: Optional[float] = None
    status: str = "Success"
    created_at: str = ""

    @classmethod
    def from_row(cls, row):
        if row is None:
            return None
        return cls(
            id=row["id"],
            transaction_id=row["transaction_id"],
            user_id=row["user_id"],
            type=row["type"],
            amount=row["amount"],
            description=row["description"],
            receiver_id=row["receiver_id"] if "receiver_id" in row.keys() else None,
            balance_after=row["balance_after"] if "balance_after" in row.keys() else None,
            status=row["status"] if "status" in row.keys() else "Success",
            created_at=row["created_at"],
        )
