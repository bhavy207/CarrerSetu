# MongoDB Data Persistence Setup Guide

## Overview
This guide ensures all profile data is properly persisted to MongoDB and remains available after page reload.

## Quick Setup Checklist

### 1. MongoDB Connection
- [ ] Ensure MongoDB is running locally or you have MongoDB Atlas connection string
- [ ] Create `.env` file in `backend/` directory with MongoDB connection:
  ```
  MONGO_URI=mongodb://localhost:27017/careersetu
  # OR for MongoDB Atlas:
  MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/careersetu
  ```

### 2. Start Backend Server
```bash
cd backend
npm install
npm start
```
You should see: `MongoDB Connected: localhost` (or your connection host)

### 3. Profile Data Flow
The fixed system now works like this:

**On First Profile Save:**
1. User fills profile form on ProfileSettings page
2. Data is sent to backend: `POST /api/v1/profile`
3. Backend validates and saves to MongoDB
4. Response is saved to browser localStorage AND Auth context
5. Success message shows "Profile saved successfully!"

**On Page Reload:**
1. App loads and detects logged-in user (token exists)
2. AppLayout component auto-fetches profile from MongoDB
3. Data is restored to Auth context
4. ProfileSettings loads and displays saved data
5. All other components can access profile via AuthContext

**On Logout:**
1. All local cache (localStorage) is cleared
2. Auth context is cleared
3. User redirected to login

## Database Schema

Your profile data is stored in MongoDB with this structure:

```json
{
  "_id": "ObjectId",
  "user": "UserId (ObjectId)",
  "full_name": "string",
  "age": "number | null",
  "preferred_language": "string",
  "academic_info": {
    "highest_qualification": "string (required)",
    "background_stream": "string",
    "institution": "string",
    "year_of_completion": "number"
  },
  "career_aspirations": {
    "target_role": "string (required)",
    "preferred_industry": "string",
    "preferred_location": "string"
  },
  "skills": {
    "technical_skills": ["string"],
    "soft_skills": ["string"],
    "certifications": ["string"]
  },
  "nsqf_level": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Files Changed

### Backend
- **`backend/routes/profileRoutes.js`**
  - Enhanced validation for required fields
  - Improved error messages with better logging
  - Better handling of array data types (skills)
  - Preserves all fields on updates

- **`backend/.env.example`**
  - New template for environment configuration

### Frontend
- **`frontend/src/context/AuthContext.tsx`**
  - Added `profileData` state to store profile in context
  - Added `setProfileData()` function for context updates
  - Profile data is persisted to localStorage

- **`frontend/src/App.tsx`**
  - AppLayout now auto-loads profile from MongoDB on login
  - Uses `useEffect` to fetch fresh data from backend

- **`frontend/src/components/ProfileSettings.tsx`**
  - Loads profile from context first (faster UX)
  - Always fetches fresh from backend for sync
  - Updates context after successful save
  - Better form data mapping

## Verification Steps

### 1. Test Profile Save
```bash
# In terminal
cd CareerSetu/frontend
npm run dev

# Open http://localhost:5173
# Login → Navigate to "My Profile"
# Fill out all required fields
# Click "Save Profile"
# ✓ Should see "Profile saved successfully!"
```

### 2. Test Data Persistence
```bash
# After profile is saved:
# 1. Refresh browser page (F5)
# 2. Profile data should still be visible
# 3. Log out and log back in
# 4. Profile data should still be visible
```

### 3. Test MongoDB Data
```bash
# In MongoDB client (or mongosh):
use careersetu
db.profiles.findOne({})
# Should see your saved profile data
```

### 4. Troubleshooting
If profile data disappears after reload:

**Check MongoDB Connection:**
```bash
# In backend console, look for:
# "MongoDB Connected: localhost" or cluster name
```

**Check Browser Console:**
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls
  - Should see GET `/api/v1/profile` returning 200 with full data

**Check Backend Logs:**
- Should see: "Profile saved for user [ID]: [ProfileID]"
- Should see: "Profile retrieved for user [ID]: [ProfileID]"

**Check localStorage:**
```javascript
// In browser console:
localStorage.getItem('profileData')
// Should show your profile JSON
```

## Best Practices

1. Always ensure MongoDB is running before starting backend
2. Check backend console for "MongoDB Connected" message
3. Use MongoDB compass to inspect saved data
4. Keep `.env` file with correct MONGO_URI
5. Never commit `.env` to git (add to .gitignore)

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/profile` | Fetch user's profile |
| POST | `/api/v1/profile` | Create/Update profile (upsert) |
| PUT | `/api/v1/profile` | Partial update of profile |

All endpoints require `Authorization: Bearer <token>` header.

## Notes

- Profile is uniquely tied to user via `user` field reference
- One profile per user (unique constraint)
- All timestamps are auto-managed by MongoDB
- Required fields: `highest_qualification`, `target_role`
- Skills are stored as arrays of strings
