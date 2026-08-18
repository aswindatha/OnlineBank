"""
FastAPI server for OnlineBank.
Wraps existing service layer with REST endpoints.
Run: python -m uvicorn api:app --reload --port 8000
"""

import os
import sys
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, status, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.db import init_database
from services import auth_service, account_service, transaction_service, notification_service, admin_service

app = FastAPI(title="OnlineBank API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory token store: token -> user_id
_tokens: dict[str, int] = {}


# ---------------------------------------------------------------------------
# Auth dependency
# ---------------------------------------------------------------------------

def get_current_user_id(authorization: str = Header(None)) -> int:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    user_id = _tokens.get(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_id


def get_current_user(user_id: int = Depends(get_current_user_id)):
    user = account_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_admin(user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str
    email: str
    phone: str
    address: str
    account_type: str = "Savings"


class ForgotPasswordRequest(BaseModel):
    username: str
    email: str


class UpdateProfileRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    address: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class AvatarColorRequest(BaseModel):
    color_hex: str


class DepositRequest(BaseModel):
    amount: float
    description: str = "Cash Deposit"


class WithdrawRequest(BaseModel):
    amount: float
    description: str = "Cash Withdrawal"


class TransferRequest(BaseModel):
    receiver_id: int
    amount: float
    remarks: str = "Fund Transfer"


class AddUserRequest(BaseModel):
    username: str
    password: str
    full_name: str
    email: str
    phone: str
    address: str
    account_type: str = "Savings"
    initial_balance: float = 0.0


class UpdateUserRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    address: str


class ToggleStatusRequest(BaseModel):
    activate: bool


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------

@app.post("/api/auth/login")
def login(req: LoginRequest):
    user, error = auth_service.login(req.username, req.password)
    if error:
        raise HTTPException(status_code=400, detail=error)
    token = str(uuid.uuid4())
    _tokens[token] = user.id
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "last_login": user.last_login,
            "avatar_color": user.avatar_color,
        },
    }


@app.post("/api/auth/register")
def register(req: RegisterRequest):
    user, error = auth_service.register(
        req.username, req.password, req.full_name,
        req.email, req.phone, req.address, req.account_type,
    )
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "last_login": user.last_login,
            "avatar_color": user.avatar_color,
        }
    }


@app.post("/api/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    temp_password, error = auth_service.forgot_password(req.username, req.email)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"temp_password": temp_password}


@app.get("/api/auth/login-history")
def login_history(user_id: int = Depends(get_current_user_id)):
    return auth_service.get_login_history(user_id)


@app.post("/api/auth/logout")
def logout(user_id: int = Depends(get_current_user_id)):
    # Remove all tokens for this user
    to_remove = [t for t, uid in _tokens.items() if uid == user_id]
    for t in to_remove:
        del _tokens[t]
    return {"message": "Logged out"}


# ---------------------------------------------------------------------------
# Account endpoints
# ---------------------------------------------------------------------------

@app.get("/api/account")
def get_account(user_id: int = Depends(get_current_user_id)):
    acc = account_service.get_account_dict(user_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc


@app.get("/api/account/balance")
def get_balance(user_id: int = Depends(get_current_user_id)):
    return {"balance": account_service.get_balance(user_id)}


@app.put("/api/account/profile")
def update_profile(req: UpdateProfileRequest, user_id: int = Depends(get_current_user_id)):
    success, error = account_service.update_profile(user_id, req.full_name, req.email, req.phone, req.address)
    if error:
        raise HTTPException(status_code=400, detail=error)
    user = account_service.get_user_by_id(user_id)
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "address": user.address,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "last_login": user.last_login,
        "avatar_color": user.avatar_color,
    }


@app.put("/api/account/password")
def change_password(req: ChangePasswordRequest, user_id: int = Depends(get_current_user_id)):
    success, error = account_service.change_password(user_id, req.old_password, req.new_password)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Password changed successfully"}


@app.put("/api/account/avatar-color")
def update_avatar_color(req: AvatarColorRequest, user_id: int = Depends(get_current_user_id)):
    account_service.update_avatar_color(user_id, req.color_hex)
    return {"message": "Avatar color updated"}


@app.get("/api/account/users")
def get_active_users(user_id: int = Depends(get_current_user_id)):
    users = account_service.get_all_users(active_only=True)
    return [u for u in users if u["id"] != user_id]


# ---------------------------------------------------------------------------
# Transaction endpoints
# ---------------------------------------------------------------------------

@app.post("/api/transactions/deposit")
def deposit(req: DepositRequest, user_id: int = Depends(get_current_user_id)):
    success, error, receipt = transaction_service.deposit(user_id, req.amount, req.description)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return receipt


@app.post("/api/transactions/withdraw")
def withdraw(req: WithdrawRequest, user_id: int = Depends(get_current_user_id)):
    success, error, receipt = transaction_service.withdraw(user_id, req.amount, req.description)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return receipt


@app.post("/api/transactions/transfer")
def transfer(req: TransferRequest, user_id: int = Depends(get_current_user_id)):
    success, error, receipt = transaction_service.transfer(user_id, req.receiver_id, req.amount, req.remarks)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return receipt


@app.get("/api/transactions")
def get_transactions(
    user_id: int = Depends(get_current_user_id),
    limit: Optional[int] = Query(None),
    offset: int = Query(0),
    tx_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    return transaction_service.get_transactions(user_id, limit=limit, offset=offset, tx_type=tx_type, search=search)


@app.get("/api/transactions/mini-statement")
def mini_statement(user_id: int = Depends(get_current_user_id), limit: int = Query(10)):
    return transaction_service.get_mini_statement(user_id, limit)


@app.get("/api/transactions/stats")
def transaction_stats(user_id: int = Depends(get_current_user_id)):
    return transaction_service.get_transaction_stats(user_id)


@app.get("/api/transactions/recent-recipients")
def recent_recipients(user_id: int = Depends(get_current_user_id)):
    return transaction_service.get_recent_recipients(user_id)


@app.get("/api/transactions/monthly-activity")
def monthly_activity(user_id: int = Depends(get_current_user_id), months: int = Query(6)):
    return transaction_service.get_monthly_activity(user_id, months)


# ---------------------------------------------------------------------------
# Notification endpoints
# ---------------------------------------------------------------------------

@app.get("/api/notifications")
def get_notifications(user_id: int = Depends(get_current_user_id), unread_only: bool = Query(False)):
    return notification_service.get_notifications(user_id, unread_only=unread_only)


@app.get("/api/notifications/unread-count")
def unread_count(user_id: int = Depends(get_current_user_id)):
    return {"count": notification_service.get_unread_count(user_id)}


@app.put("/api/notifications/{notification_id}/read")
def mark_read(notification_id: int, user_id: int = Depends(get_current_user_id)):
    notification_service.mark_as_read(notification_id)
    return {"message": "Marked as read"}


@app.put("/api/notifications/read-all")
def mark_all_read(user_id: int = Depends(get_current_user_id)):
    notification_service.mark_all_read(user_id)
    return {"message": "All marked as read"}


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------

@app.get("/api/admin/stats")
def admin_stats(admin=Depends(require_admin)):
    return admin_service.get_admin_stats()


@app.get("/api/admin/users")
def admin_get_users(admin=Depends(require_admin)):
    return admin_service.get_all_users()


@app.post("/api/admin/users")
def admin_add_user(req: AddUserRequest, admin=Depends(require_admin)):
    success, error = admin_service.add_user(
        req.username, req.password, req.full_name, req.email,
        req.phone, req.address, req.account_type, req.initial_balance,
    )
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "User added successfully"}


@app.put("/api/admin/users/{user_id}")
def admin_update_user(user_id: int, req: UpdateUserRequest, admin=Depends(require_admin)):
    admin_service.update_user(user_id, req.full_name, req.email, req.phone, req.address)
    return {"message": "User updated"}


@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: int, admin=Depends(require_admin)):
    admin_service.delete_user(user_id)
    return {"message": "User deleted"}


@app.put("/api/admin/users/{user_id}/toggle-status")
def admin_toggle_status(user_id: int, req: ToggleStatusRequest, admin=Depends(require_admin)):
    admin_service.toggle_user_status(user_id, req.activate)
    return {"message": "Status updated"}


@app.get("/api/admin/transactions")
def admin_get_transactions(
    admin=Depends(require_admin),
    limit: int = Query(100),
    tx_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
):
    return admin_service.get_all_transactions(limit=limit, tx_type=tx_type, search=search, date_from=date_from, date_to=date_to)


@app.get("/api/admin/monthly-activity")
def admin_monthly_activity(admin=Depends(require_admin), months: int = Query(6)):
    return admin_service.get_admin_monthly_activity(months)


@app.get("/api/admin/recent-activity")
def admin_recent_activity(admin=Depends(require_admin), limit: int = Query(10)):
    return admin_service.get_recent_activity(limit)


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
def startup():
    init_database()


# Serve frontend build (if it exists) in production
_frontend_dist = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "dist")
if os.path.isdir(_frontend_dist):
    from fastapi.responses import FileResponse

    @app.get("/")
    def serve_root():
        return FileResponse(os.path.join(_frontend_dist, "index.html"))

    app.mount("/assets", StaticFiles(directory=os.path.join(_frontend_dist, "assets")), name="assets")
