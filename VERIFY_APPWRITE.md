# ✅ Verify Your Appwrite Credentials

## The Problem
Your Appwrite connection is failing. Let's verify all credentials are correct.

## Step-by-Step Verification

### Step 1: Verify Project Exists

1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Check if your project appears in the project list
3. If not, **create a new project**:
   - Click "Create Project"
   - Name it (e.g., "Brahma Fest")
   - Copy the **Project ID** (starts with numbers/letters)

### Step 2: Get Correct Project ID

1. In Appwrite Console, select your project
2. Click **Settings** (gear icon) → **General**
3. Find **"Project ID"** (it's a long string like `67a1b2c3d4e5f6...`)
4. **Copy it exactly** (no spaces)

### Step 3: Verify/Create API Key

1. In Appwrite Console → **Settings** → **API Keys**
2. Check if you have an API key
3. If not, **create one**:
   - Click **"Create API Key"**
   - Name: "Server Key"
   - **Permissions**: 
     - ✅ `databases.read`
     - ✅ `databases.write`
   - Click **"Create"**
   - **Copy the key immediately** (you won't see it again!)

### Step 4: Verify/Create Database

1. In Appwrite Console → **Databases**
2. Check if you have a database
3. If not, **create one**:
   - Click **"Create Database"**
   - Name: "brahma_fest_db"
   - Copy the **Database ID**

### Step 5: Verify/Create Collections

1. Go to your Database → **Collections**
2. Check if `events` collection exists
3. If not, **create it**:
   - Click **"Create Collection"**
   - Name: `events`
   - Add attributes:
     - `event_id` (String, 255, Required, Unique)
     - `event_name` (String, 255, Required)
     - `event_pass` (String, 255, Required)
   - **Permissions**: Read: Any, Write: API Key
   - Create index on `event_id`

4. Check if `tickets` collection exists
5. If not, **create it**:
   - Click **"Create Collection"**
   - Name: `tickets`
   - Add attributes:
     - `ticket_id` (String, 255, Required, Unique)
     - `event_id` (String, 255, Required)
     - `student_name` (String, 255, Required)
     - `usage` (Boolean, Required, Default: false)
   - **Permissions**: Read: Any, Write: API Key
   - Create indexes on `ticket_id` and `event_id`

### Step 6: Update .env File

Open `.env` and update with **exact values** from Appwrite:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=paste_exact_project_id_here
APPWRITE_API_KEY=paste_exact_api_key_here
APPWRITE_DATABASE_ID=paste_exact_database_id_here
APPWRITE_COLLECTION_EVENTS=events
APPWRITE_COLLECTION_TICKETS=tickets
```

**⚠️ Important:**
- No extra spaces
- No quotes around values
- Copy IDs exactly as shown

### Step 7: Add Test Event Data

1. Go to Databases → Your Database → Collections → `events`
2. Click **"Create Document"**
3. Add:
   ```json
   {
     "event_id": "TEST001",
     "event_name": "Test Event",
     "event_pass": "test123"
   }
   ```
4. Click **"Create"**

### Step 8: Test Connection

Run the diagnostic:
```bash
node test-appwrite.js
```

You should see:
```
✅ US East (https://cloud.appwrite.io/v1) - Project accessible!
✅ Database found: brahma_fest_db
✅ Collections found: 2
✅ Events collection accessible (1 documents)
```

### Step 9: Restart Server

```bash
npm start
```

### Step 10: Test Login

1. Open `http://localhost:3000`
2. Login with:
   - Event ID: `TEST001`
   - Password: `test123`

## Common Mistakes

❌ **Wrong Project ID**: Copy from Settings → General, not from URL
❌ **API Key without permissions**: Must have `databases.read` and `databases.write`
❌ **Wrong Database ID**: Copy from Database Settings, not Collection ID
❌ **Spaces in .env**: No spaces around `=` sign
❌ **Missing test data**: Must add event with `event_id: TEST001`

## Still Not Working?

1. **Double-check all IDs** in Appwrite Console
2. **Regenerate API Key** if unsure
3. **Check server console** for detailed error messages
4. **Run diagnostic**: `node test-appwrite.js`

