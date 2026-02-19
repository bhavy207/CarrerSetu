#!/bin/bash
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_ROOT"

# Start Backend
echo "Starting Backend Server on Port 8000..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend on Default Port..."
cd ../frontend
npm run dev -- --open &
FRONTEND_PID=$!

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT

wait
