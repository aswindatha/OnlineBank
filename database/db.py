"""
Database module for the Online Banking Portal.
Handles SQLite connection, schema creation, and demo data seeding.
"""

import os
import sqlite3
import random
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "bank.db")


def get_connection():
    """Return a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_database():
    """Create tables if they don't exist and seed demo data on first run."""
    conn = get_connection()
    cursor = conn.cursor()

    # --- Users table ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            role TEXT DEFAULT 'user',
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now','localtime')),
            last_login TEXT,
            avatar_color TEXT DEFAULT '#1a237e'
        )
    """)

    # --- Accounts table ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            account_number TEXT UNIQUE NOT NULL,
            account_type TEXT NOT NULL,
            balance REAL DEFAULT 0.0,
            branch TEXT DEFAULT 'Main Branch',
            ifsc TEXT DEFAULT 'OBPK0000001',
            status TEXT DEFAULT 'Active',
            created_at TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # --- Transactions table ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            receiver_id INTEGER,
            balance_after REAL,
            status TEXT DEFAULT 'Success',
            created_at TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        )
    """)

    # --- Migration: add status column if it doesn't exist (for existing DBs) ---
    try:
        cursor.execute("SELECT status FROM transactions LIMIT 1")
    except Exception:
        cursor.execute("ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'Success'")
        cursor.execute("UPDATE transactions SET status = 'Success' WHERE status IS NULL")

    # --- Notifications table ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            category TEXT DEFAULT 'info',
            is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # --- Login history table ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS login_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            login_time TEXT DEFAULT (datetime('now','localtime')),
            status TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()

    # Seed demo data if no users exist
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        _seed_demo_data(conn)

    conn.close()


def _seed_demo_data(conn):
    """Insert admin, 10 sample users, accounts, transactions, and notifications."""
    cursor = conn.cursor()

    # --- Admin ---
    cursor.execute(
        "INSERT INTO users (username, password, full_name, email, phone, address, role, avatar_color) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        ("admin", "admin123", "System Administrator", "admin@onlinebank.com",
         "9000000000", "Bank HQ, Main Branch", "admin", "#b71c1c"),
    )

    # --- 10 sample users ---
    sample_users = [
        ("john_doe", "password123", "John Doe", "john.doe@email.com", "9876543210", "123 Elm Street, Springfield"),
        ("jane_smith", "password123", "Jane Smith", "jane.smith@email.com", "9876543211", "456 Oak Avenue, Riverdale"),
        ("mike_johnson", "password123", "Mike Johnson", "mike.johnson@email.com", "9876543212", "789 Pine Road, Lakeside"),
        ("sarah_williams", "password123", "Sarah Williams", "sarah.w@email.com", "9876543213", "321 Maple Lane, Hilltown"),
        ("david_brown", "password123", "David Brown", "david.brown@email.com", "9876543214", "654 Cedar Blvd, Valley City"),
        ("emily_davis", "password123", "Emily Davis", "emily.davis@email.com", "9876543215", "987 Birch Way, Portside"),
        ("chris_miller", "password123", "Chris Miller", "chris.miller@email.com", "9876543216", "147 Spruce Court, Eastfield"),
        ("olivia_wilson", "password123", "Olivia Wilson", "olivia.w@email.com", "9876543217", "258 Aspen Drive, Westwood"),
        ("robert_taylor", "password123", "Robert Taylor", "robert.taylor@email.com", "9876543218", "369 Willow Path, Northgate"),
        ("sophia_anderson", "password123", "Sophia Anderson", "sophia.a@email.com", "9876543219", "741 Poplar Street, Southend"),
    ]

    avatar_colors = [
        "#1565c0", "#2e7d32", "#6a1b9a", "#e65100", "#00695c",
        "#ad1457", "#283593", "#558b2f", "#c2185b", "#00838f",
    ]

    user_ids = []
    for i, (uname, pwd, fname, email, phone, addr) in enumerate(sample_users):
        color = avatar_colors[i % len(avatar_colors)]
        cursor.execute(
            "INSERT INTO users (username, password, full_name, email, phone, address, role, avatar_color) "
            "VALUES (?, ?, ?, ?, ?, ?, 'user', ?)",
            (uname, pwd, fname, email, phone, addr, color),
        )
        user_ids.append(cursor.lastrowid)

    # --- Accounts for each user ---
    account_types = ["Savings", "Current", "Savings", "Current", "Savings",
                     "Savings", "Current", "Savings", "Current", "Savings"]
    balances = [52450.00, 128300.50, 8900.00, 76200.75, 45100.00,
                234750.00, 15600.00, 98750.25, 67800.00, 112400.00]

    for uid, atype, bal in zip(user_ids, account_types, balances):
        acc_num = f"OBPK{uid:07d}"
        cursor.execute(
            "INSERT INTO accounts (user_id, account_number, account_type, balance) VALUES (?, ?, ?, ?)",
            (uid, acc_num, atype, bal),
        )

    # --- Generate sample transactions ---
    tx_types = ["Deposit", "Withdraw", "Transfer"]
    descriptions = {
        "Deposit": ["Salary Credit", "Cash Deposit", "Cheque Deposit", "Interest Credit", "Refund Credit"],
        "Withdraw": ["ATM Withdrawal", "Bill Payment", "Shopping", "Cash Withdrawal", "Fee Deduction"],
        "Transfer": ["Fund Transfer Sent", "Fund Transfer Received", "P2P Transfer", "Family Transfer"],
    }

    now = datetime.now()
    for uid in user_ids:
        num_tx = random.randint(8, 15)
        for _ in range(num_tx):
            tx_type = random.choice(tx_types)
            amount = round(random.uniform(500, 15000), 2)
            desc = random.choice(descriptions[tx_type])
            days_ago = random.randint(0, 90)
            tx_time = (now - timedelta(days=days_ago, hours=random.randint(0, 23),
                                        minutes=random.randint(0, 59))).strftime("%Y-%m-%d %H:%M:%S")
            tx_id = f"TXN{random.randint(100000, 999999)}"

            receiver_id = None
            if tx_type == "Transfer":
                other_ids = [x for x in user_ids if x != uid]
                receiver_id = random.choice(other_ids)
                desc = f"Transfer to user #{receiver_id}"

            cursor.execute(
                "INSERT INTO transactions (transaction_id, user_id, type, amount, description, receiver_id, created_at, status) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, 'Success')",
                (tx_id, uid, tx_type, amount, desc, receiver_id, tx_time),
            )

    # --- Notifications for each user ---
    notif_templates = [
        ("Welcome!", "Welcome to OnlineBank. Your account is now active.", "info"),
        ("Security Alert", "Your account was accessed from a new device.", "warning"),
        ("Deposit Successful", "Your salary has been credited to your account.", "success"),
        ("Password Changed", "Your password was changed successfully.", "info"),
        ("Transfer Complete", "Your fund transfer was completed successfully.", "success"),
    ]

    for uid in user_ids:
        for title, msg, cat in random.sample(notif_templates, min(3, len(notif_templates))):
            days_ago = random.randint(0, 30)
            ntime = (now - timedelta(days=days_ago)).strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute(
                "INSERT INTO notifications (user_id, title, message, category, created_at) VALUES (?, ?, ?, ?, ?)",
                (uid, title, msg, cat, ntime),
            )

    # Admin notification
    cursor.execute(
        "INSERT INTO notifications (user_id, title, message, category) VALUES (?, ?, ?, ?)",
        (1, "System Ready", "Banking system initialized with 10 demo users.", "info"),
    )

    conn.commit()
