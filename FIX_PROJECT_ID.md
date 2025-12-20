# 🔧 Fix: Project ID Error

## The Error
```
Project with the requested ID could not be found
```

## The Problem
Your `APPWRITE_PROJECT_ID` in `.env` is incorrect.

## The Solution

### Step 1: Get Your Correct Project ID

1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project (or create a new one if needed)
3. Click **Settings** (gear icon) → **General**
4. Copy the **Project ID** (it's a long alphanumeric string)

### Step 2: Update .env File

Open your `.env` file and update the `APPWRITE_PROJECT_ID` line:

```env
APPWRITE_PROJECT_ID=your_correct_project_id_here
```

Replace `your_correct_project_id_here` with the Project ID you copied.

### Step 3: Verify Other Settings

Make sure your `.env` also has:
- ✅ Correct `APPWRITE_API_KEY` (from Settings → API Keys)
- ✅ Correct `APPWRITE_DATABASE_ID` (from Databases → Your Database → Settings)
- ✅ Collection names match: `events` and `tickets`

### Step 4: Restart Server

```bash
# Stop server (Ctrl+C)
# Restart:
npm start
```

### Step 5: Add Test Data

After fixing Project ID, add test event in Appwrite:

1. Go to Appwrite Console → Databases → Your Database → Collections → `events`
2. Click **Create Document**
3. Add:
   ```json
   {
     "event_id": "TEST001",
     "event_name": "Test Event",
     "event_pass": "test123"
   }
   ```

### Step 6: Test Login

1. Open `http://localhost:3000`
2. Login with:
   - Event ID: `TEST001`
   - Password: `test123`

## Still Having Issues?

Check:
- ✅ Project ID is correct (no extra spaces)
- ✅ API Key has `databases.read` and `databases.write` permissions
- ✅ Database ID is correct
- ✅ Collections `events` and `tickets` exist
- ✅ Test event data is added

