# 🔧 Simple Fix: API Key Permissions

## The Problem
You can't find `documents.read` and `documents.write` in API key settings.

## Solution 1: Set Permissions on Collections (Easier!)

Instead of API key permissions, set permissions directly on collections:

### Step 1: Set Permissions for `events` Collection

1. Go to Appwrite Console
2. **Databases** → `brahma_fest_db` → **Collections** → `events`
3. Click **Settings** tab (or gear icon)
4. Click **Permissions** section
5. Click **Add Permission** or **+** button
6. Select:
   - **Role**: `API Key` (or find your API key name)
   - **Read**: ✅ Check
   - **Write**: ✅ Check
7. Click **Save** or **Update**

### Step 2: Set Permissions for `tickets` Collection

1. Go to **Collections** → `tickets`
2. Click **Settings** → **Permissions**
3. Add same permission:
   - **Role**: `API Key`
   - **Read**: ✅
   - **Write**: ✅
4. Save

### Step 3: Test

```bash
npm start
```

Then try login with:
- Event ID: `TEST001`
- Password: `test123`

## Solution 2: Update API Key Permissions

1. **Settings** → **API Keys**
2. Click **Edit** on your existing API key (or create new one)
3. In the **Scopes** section, check these permissions:
   - ✅ **databases.read** - Read databases
   - ✅ **databases.write** - Already checked ✓
   - ✅ **tables.read** - Read tables/collections
   - ✅ **tables.write** - Create/update tables
   - ✅ **rows.read** - **Read documents (THIS IS documents.read!)**
   - ✅ **rows.write** - **Write documents (THIS IS documents.write!)**
4. Click **Update** (or **Create** if new key)
5. If you created a new key, copy it and update `.env`:
   ```env
   APPWRITE_API_KEY=paste_new_key_here
   ```
6. Restart server

**Note:** In Appwrite, "rows" = "documents". So `rows.read` = `documents.read`!

## Solution 3: Use "Any" Permission on Collections

If you can't find API Key role:

1. Go to Collection → Settings → Permissions
2. Add permission:
   - **Role**: `Any` (allows anyone to read)
   - **Read**: ✅
   - **Write**: Leave unchecked (only API key can write)
3. This allows reading without API key permission

## Quick Test

After setting permissions, test:
```bash
node -e "require('dotenv').config(); const { Client, Databases } = require('node-appwrite'); const client = new Client(); client.setEndpoint(process.env.APPWRITE_ENDPOINT).setProject(process.env.APPWRITE_PROJECT_ID).setKey(process.env.APPWRITE_API_KEY); const databases = new Databases(client); databases.listDocuments(process.env.APPWRITE_DATABASE_ID, 'events', []).then(r => console.log('✅ SUCCESS! Found', r.total, 'events')).catch(e => console.error('❌ Still failing:', e.message))"
```

## Which Solution to Use?

- **Solution 1** (Collection Permissions) - ✅ **Easiest, recommended**
- **Solution 2** (New API Key) - If Solution 1 doesn't work
- **Solution 3** (Any Role) - For testing only (less secure)

Try **Solution 1** first - it's the simplest!

