# 🚨 Quick Fix: Create .env File

## The Problem
Your server is showing "Server error" because the `.env` file with Appwrite credentials is missing.

## The Solution

### Step 1: Create `.env` file in project root

Create a file named `.env` (exactly that name, starting with a dot) in your project root folder:
```
C:\Users\alanb\Downloads\brahma_coordinor\.env
```

### Step 2: Add this content to `.env`

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
APPWRITE_DATABASE_ID=your_database_id_here
APPWRITE_COLLECTION_EVENTS=events
APPWRITE_COLLECTION_TICKETS=tickets
```

### Step 3: Fill in your Appwrite credentials

Replace the placeholder values with your actual Appwrite credentials:

1. **APPWRITE_PROJECT_ID**: 
   - Go to Appwrite Console → Your Project → Settings
   - Copy the "Project ID"

2. **APPWRITE_API_KEY**:
   - Go to Appwrite Console → Settings → API Keys
   - Click "Create API Key"
   - Name it "Server Key"
   - Permissions: `databases.read` and `databases.write`
   - Copy the generated key

3. **APPWRITE_DATABASE_ID**:
   - Go to Appwrite Console → Databases
   - Click on your database
   - Copy the "Database ID"

### Step 4: Add test data to Appwrite

After setting up `.env`, add test event data:

1. Go to Appwrite Console → Databases → Your Database → Collections → `events`
2. Click "Create Document"
3. Add:
   ```json
   {
     "event_id": "TEST001",
     "event_name": "Test Event",
     "event_pass": "test123"
   }
   ```

### Step 5: Restart server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm start
```

## Quick Test

After creating `.env` and restarting:

1. Open `http://localhost:3000`
2. Login with:
   - Event ID: `TEST001`
   - Password: `test123`

## Still Getting Errors?

Check the server console output - it will show exactly which environment variables are missing.

