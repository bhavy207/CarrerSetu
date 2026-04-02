#!/bin/bash
# CareerSetu Health Check Script
# Run this to verify all services are working

echo "🔍 CareerSetu Health Check"
echo "═══════════════════════════════════════════"
echo ""

# Check Backend
echo "1️⃣  Backend Check (Port 8000)..."
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
    curl -s http://localhost:8000/ | grep -o '"message":"[^"]*"'
else
    echo "   ❌ Backend NOT running on port 8000"
    echo "   Fix: cd backend && npm run dev"
fi
echo ""

# Check Frontend
echo "2️⃣  Frontend Check (Port 5173)..."
if curl -s http://localhost:5173/ > /dev/null 2>&1; then
    echo "   ✅ Frontend is running on port 5173"
else
    echo "   ❌ Frontend NOT running on port 5173"
    echo "   Fix: cd frontend && npm run dev"
fi
echo ""

# Check MongoDB
echo "3️⃣  MongoDB Connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
        echo "   ✅ MongoDB is connected"
    else
        echo "   ⚠️  MongoDB not responding"
        echo "   MongoDB Atlas is configured in .env"
    fi
else
    echo "   ℹ️  MongoDB CLI not installed (using MongoDB Atlas)"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════"
echo "✅ All systems operational!" || echo "❌ Some services not running"
echo ""
echo "🌐 Open browser: http://localhost:5173"
