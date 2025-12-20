# ✅ Quick Fix: Use `rows.read` and `rows.write`

## The Solution

In Appwrite API key permissions, **"rows" = "documents"**!

### Check These Permissions:

1. Go to **Settings** → **API Keys** → Edit your key
2. Check these scopes:
   - ✅ `databases.read`
   - ✅ `databases.write` (you already have this)
   - ✅ `tables.read`
   - ✅ `tables.write`
   - ✅ **`rows.read`** ← This is `documents.read`!
   - ✅ **`rows.write`** ← This is `documents.write`!

### Why?

- **Rows** = Documents in Appwrite
- `rows.read` = Read documents from collections
- `rows.write` = Create/update/delete documents

### After Checking Permissions:

1. Click **Update** or **Save**
2. Restart your server:
   ```bash
   npm start
   ```
3. Test login:
   - Event ID: `TEST001`
   - Password: `test123`

### Quick Test:

```bash
node -e "require('dotenv').config(); const { Client, Databases } = require('node-appwrite'); const client = new Client(); client.setEndpoint(process.env.APPWRITE_ENDPOINT).setProject(process.env.APPWRITE_PROJECT_ID).setKey(process.env.APPWRITE_API_KEY); const databases = new Databases(client); databases.listDocuments(process.env.APPWRITE_DATABASE_ID, 'events', []).then(r => console.log('✅ SUCCESS! Found', r.total, 'events')).catch(e => console.error('❌ Error:', e.message))"
```

You should see: `✅ SUCCESS! Found X events`

