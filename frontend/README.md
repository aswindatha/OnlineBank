# OnlineBank Web Frontend

A modern banking web application built with React, Vite, and TailwindCSS, backed by a FastAPI server that wraps the existing Python service layer.

## Prerequisites

- Python 3.12+
- Node.js 18+

## Setup & Run

### 1. Start the API server

```bash
cd OnlineBank
pip install -r requirements.txt
python -m uvicorn api:app --reload --port 8000
```

The API server runs at `http://localhost:8000`. API docs available at `http://localhost:8000/docs`.

### 2. Start the frontend dev server

```bash
cd OnlineBank/frontend
npm install
npm run dev
```

The web app runs at `http://localhost:5173`.

### 3. Open the app

Navigate to `http://localhost:5173` in your browser.

## Demo Credentials

| Role | Username     | Password       |
|------|-------------|----------------|
| Admin| `admin`     | `admin123`     |
| User | `john_doe`  | `password123`  |

## Features

- **Authentication**: Login, register, forgot password
- **Dashboard**: Balance overview, stats cards, monthly activity chart, recent transactions, quick actions
- **Deposit**: Quick deposit with amount presets and receipt
- **Withdraw**: Balance-checked withdrawal with receipt
- **Transfer**: Send money to other users with recent recipients
- **Transactions**: Full history with search, type filter, pagination, CSV export
- **Mini Statement**: Last 10 transactions at a glance
- **Notifications**: Category-coded notifications with mark-as-read
- **Profile**: Edit profile, change password, avatar color picker
- **Settings**: Dark mode toggle, account info
- **Admin Panel**: Dashboard stats, user management (add/edit/delete/activate), all transactions view

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, React Router, Recharts, Lucide icons, Axios
- **Backend**: FastAPI, Uvicorn (wraps existing Python services)
- **Database**: SQLite (shared with desktop app)

## Build for Production

```bash
cd OnlineBank/frontend
npm run build
```

The built files go to `frontend/dist/` and are automatically served by the FastAPI server in production mode.
