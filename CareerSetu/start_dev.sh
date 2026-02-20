#!/bin/bash
# ──────────────────────────────────────────────────────────────
#  CareerSetu — Dev Server Launcher
#  Starts both the Node.js backend and Vite frontend in parallel
# ──────────────────────────────────────────────────────────────

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
echo "🚀  Starting CareerSetu Development Servers..."
echo "──────────────────────────────────────────────"

# Start Backend (Node.js / Express on port 8000)
echo "📦  Backend  → http://localhost:8000"
cd "$PROJECT_ROOT/backend"
npm run dev &
BACKEND_PID=$!

# Small delay so backend starts first
sleep 2

# Start Frontend (Vite on port 5173)
echo "🎨  Frontend → http://localhost:5173"
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅  Both servers running. Press Ctrl+C to stop."
echo "──────────────────────────────────────────────"

# Gracefully kill both on Ctrl+C
trap "echo ''; echo '🛑  Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
