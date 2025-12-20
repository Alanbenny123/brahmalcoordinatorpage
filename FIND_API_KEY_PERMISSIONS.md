# 🔍 How to Find API Key Permissions in Appwrite

## Where to Find API Key Settings

### Step 1: Navigate to API Keys

1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project
3. Click **Settings** (gear icon ⚙️) in the left sidebar
4. Click **API Keys** tab

### Step 2: Edit or Create API Key

**Option A: Edit Existing Key**
- Find your API key in the list
- Click the **three dots (⋮)** or **Edit** button next to it
- Look for **"Scopes"** or **"Permissions"** section

**Option B: Create New Key**
- Click **"+ Create API Key"** button
- Name it: "Server Key" or "Full Access"
- Look for **"Scopes"** or **"Permissions"** section

## Permission Names in Appwrite

The permissions might be named differently. Look for:

### Database Permissions:
- ✅ `databases.read` - Read databases
- ✅ `databases.write` - Create/update databases

### Document Permissions:
- ✅ `documents.read` - **Read documents from collections**
- ✅ `documents.write` - Create/update/delete documents

### Alternative Names:
Sometimes they're grouped as:
- ✅ `collections.read` - Read collections and documents
- ✅ `collections.write` - Write to collections

## If You Can't Find These Options

### Option 1: Use "Full Access" or "All Permissions"
- Some Appwrite versions have a "Full Access" checkbox
- Check this to grant all permissions

### Option 2: Check Collection Permissions Instead
1. Go to **Databases** → Your Database → Collections → `events`
2. Click **Settings** → **Permissions**
3. Make sure **"API Key"** has:
   - ✅ Read access
   - ✅ Write access

### Option 3: Create New API Key with All Scopes
1. Settings → API Keys → **Create API Key**
2. Name: "Full Access Key"
3. Look for a checkbox like:
   - ✅ "All permissions" or
   - ✅ "Full access" or
   - ✅ "Select all"
4. Create the key
5. Copy the new key to `.env`

## Quick Test After Updating

Run this to test if permissions work:
```bash
node test-appwrite.js
```

Or test directly:
```bash
node -e "require('dotenv').config(); const { Client, Databases, Query } = require('node-appwrite'); const client = new Client(); client.setEndpoint(process.env.APPWRITE_ENDPOINT).setProject(process.env.APPWRITE_PROJECT_ID).setKey(process.env.APPWRITE_API_KEY); const databases = new Databases(client); databases.listDocuments(process.env.APPWRITE_DATABASE_ID, 'events', []).then(r => console.log('✅ Success! Found', r.total, 'events')).catch(e => console.error('❌ Error:', e.message))"
```

## Screenshot Guide

When editing API key, you should see something like:
```
Scopes / Permissions:
☐ databases.read
☐ databases.write  
☐ documents.read    ← Check this!
☐ documents.write   ← Check this!
☐ collections.read
☐ collections.write
```

Or a simpler interface with:
```
☑ Full Access
```

## Still Can't Find It?

1. **Check Appwrite Version**: Some older versions have different UI
2. **Try Collection-Level Permissions**: Set permissions on the collection itself
3. **Use Admin SDK**: If you have admin access, you can set permissions programmatically
4. **Contact Support**: Appwrite documentation or community forum

## Alternative: Set Collection Permissions

If API key permissions don't work, set permissions on collections:

1. Databases → `brahma_fest_db` → Collections → `events`
2. Settings → Permissions
3. Add permission:
   - **Role**: API Key (your key name)
   - **Read**: ✅
   - **Write**: ✅
4. Repeat for `tickets` collection


