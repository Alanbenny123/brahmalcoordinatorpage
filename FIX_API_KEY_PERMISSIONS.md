# 🔧 Fix: API Key Missing Permissions

## The Error
```
missing scopes (["documents.read"])
```

## The Problem
Your API key doesn't have the `documents.read` permission, which is required to read documents from collections.

## The Solution

### Step 1: Update API Key Permissions

1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project
3. Go to **Settings** → **API Keys**
4. Find your API key (or create a new one)
5. Click **Edit** (or create new key)
6. **Set these permissions:**
   - ✅ `databases.read`
   - ✅ `databases.write`
   - ✅ `documents.read` ← **This is missing!**
   - ✅ `documents.write` (optional, but recommended)

### Step 2: Update .env with New API Key

If you created a new API key:
1. Copy the new API key
2. Update `.env`:
   ```env
   APPWRITE_API_KEY=your_new_api_key_here
   ```

### Step 3: Restart Server

```bash
npm start
```

### Step 4: Test Again

Run the diagnostic:
```bash
node test-appwrite.js
```

You should now see:
```
✅ Your Endpoint (https://sgp.cloud.appwrite.io/v1) - Project accessible!
✅ Database found: brahma_fest_db
✅ Collections found: 2
✅ Events collection accessible (X documents)
```

## Required API Key Permissions

For your app to work, the API key needs:
- ✅ `databases.read` - Read database info
- ✅ `databases.write` - Create/update databases
- ✅ `documents.read` - **Read documents from collections** (currently missing!)
- ✅ `documents.write` - Create/update/delete documents

## Quick Fix

1. Appwrite Console → Settings → API Keys
2. Edit your key (or create new)
3. Add `documents.read` permission
4. Update `.env` if you created a new key
5. Restart server


