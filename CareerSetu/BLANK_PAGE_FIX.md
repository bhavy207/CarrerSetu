# Blank Page After Login - Debugging & Fix Guide

## Issue
After login, you see a blank page instead of the dashboard or form.

## ✅ What I Fixed

### 1. **Better Error Handling in Frontend** (`App.tsx`)
- Added error detection for backend connectivity
- Shows helpful error messages instead of blank page
- Includes "how to fix" instructions right in the app

### 2. **Graceful Profile Loading** (`App.tsx`)
- Profile loading now has 3-second timeout
- Doesn't block the page if profile fails to load
- Shows warning in browser console if profile can't be retrieved

### 3. **Enhanced ProfileSettings** (`ProfileSettings.tsx`)
- Loads profile from cache first (faster UX)
- Always syncs with backend (MongoDB)
- Better error messages on save

---

## 🔧 How to Troubleshoot

### Step 1: Check Backend Status
Open PowerShell and verify the backend is running:

```powershell
curl http://localhost:8000/ -UseBasicParsing
```

Expected response:
```json
{"message":"Welcome to Career Setu AI Engine","version":"2.0"}
```

### Step 2: Check Frontend Status
```powershell
curl http://localhost:5173/ -UseBasicParsing
```

Should return HTTP 200 OK

### Step 3: Check MongoDB Connection
Backend should show this on startup:
```
🚀 Server running on port 8000
```

If you see connection errors, check your `.env` file:
```
MONGO_URI=mongodb+srv://23it056_db_user:Archi.1910@careersetu.q0aykfg.mongodb.net/careersetu?appName=CareerSetu
```

### Step 4: Open Developer Tools
In browser, press **F12** to open DevTools:
- **Console tab**: Check for JavaScript errors
- **Network tab**: See API calls to backend
- **Look for any red errors**

---

## 📋 Common Issues & Fixes

### Issue: Backend shows "Cannot GET /"
**Cause**: Backend not running
**Fix**: 
```bash
cd CareerSetu/backend
npm run dev
```

### Issue: "Connection refused" error
**Cause**: Backend is on wrong port or crashed
**Fix**: Kill any existing processes and restart:
```bash
# Kill old processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force

# Restart backend
cd backend
npm run dev
```

### Issue: Blank page shows "Backend error"
**Cause**: Backend responded but couldn't fetch user data
**Fix**: Check MongoDB connection in `.env`

### Issue: Page loads but says "Profile loading..."
**Cause**: Profile API taking too long
**Fix**: 
1. Check network tab (F12) for slow requests
2. Verify MongoDB Atlas connection is active
3. Restart backend to reconnect to MongoDB

---

## 🚀 Quick Test Flow

1. **Start services**:
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Open browser**: http://localhost:5173

3. **Try to login**:
   - Username: any username (or existing)
   - Password: any password (or existing)

4. **Check what you see**:
   - ✅ See DataForm? Profile not filled yet
   - ✅ See Dashboard? You have an active path
   - ❌ See blank page? Check F12 console for errors
   - ⚠️ See error message? Follow the suggested fix

---

## 🆘 Still Stuck?

### Check the logs:
```bash
# Backend logs
cd backend && npm run dev
# Look for: "MongoDB Connected", "Server running"

# Frontend logs
cd frontend && npm run dev
# Look for any errors
```

### Check browser console (F12):
- Look for red error messages
- Check Network tab for failed API calls
- Look for CORS errors

### Check if MongoDB Atlas is working:
1. Go to https://cloud.mongodb.com
2. Check cluster status
3. Review connection details in `.env`

---

## 📊 Current Status

Both services are running:
- **Backend**: http://localhost:8000 ✅
- **Frontend**: http://localhost:5173 ✅
- **MongoDB**: MongoDB Atlas configured in `.env` ✅

All servers are ready. The blank page issue should now show proper error messages instead.

---

## 🎯 Next Steps

1. **Open http://localhost:5173** in your browser
2. **Log in** with your credentials
3. **If you see an error**, read the error message - it will tell you how to fix it
4. **If blank page**, press **F12** and check Console tab for errors

The app will now guide you to the solution! 🚀
