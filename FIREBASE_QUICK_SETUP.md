# 🔥 Firebase Setup - Quick Guide for Hybrid System

## Your Hybrid Architecture

```
┌─────────────────┐
│   Appwrite      │ → Database (events, tickets, attendance)
│   (Required)    │
└─────────────────┘

┌─────────────────┐
│   Firebase      │ → Storage (photos, certificates, QR codes)
│   (Optional)    │
└─────────────────┘
```

**Firebase is optional** - your app works without it for basic login/scanning, but you need it for:
- 📸 Event photos & banners
- 🎓 Auto-generated certificates  
- 📱 QR code images
- 📄 Document storage

---

## Quick Setup (5 Steps)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it (e.g., "Brahma Fest")
4. Click **"Create project"**

### Step 2: Enable Storage
1. In Firebase Console → **Storage** (left sidebar)
2. Click **"Get started"**
3. Choose **"Start in test mode"** (for development)
4. Select storage location (closest to your users)
5. Click **"Done"**

### Step 3: Get Service Account Key
1. Firebase Console → ⚙️ **Settings** → **Project settings**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** (JSON file downloads)

### Step 4: Configure in Your Project
1. **Rename** downloaded file to: `serviceAccountKey.json`
2. **Move** it to project root (same folder as `server.js`):

```
brahma_coordinor/
├── server.js
├── appwrite.js
├── firebase.js
├── serviceAccountKey.json  ← Place here
└── package.json
```

### Step 5: Test It
```bash
# Start server
npm start

# You should see:
# ✅ Firebase Storage initialized
```

Or run the test script:
```bash
node test-firebase.js
```

---

## Verify Setup

When you start the server, check console output:

✅ **Success:**
```
✅ Firebase Storage initialized
```

⚠️ **Warning (but app still works):**
```
⚠️ Firebase serviceAccountKey.json not found. Firebase Storage will not be available.
```

❌ **Error:**
```
❌ Firebase initialization error: [error message]
```

---

## Storage Rules (Development)

In Firebase Console → Storage → Rules, use this for testing:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ For production**, use stricter rules (see `FIREBASE_SETUP.md`).

---

## File Structure in Firebase Storage

Your files will be organized like this:

```
your-bucket/
├── events/
│   ├── photos/
│   └── banners/
├── certificates/
├── qr-codes/
└── documents/
```

---

## Using Firebase in Your Code

### Check if Firebase is available:
```javascript
const { storage } = require('./firebase');

if (!storage) {
  console.log('Firebase Storage not available');
  // Handle gracefully - app still works without it
}
```

### Upload a file:
```javascript
const { storage } = require('./firebase');

async function uploadFile(filePath, destinationPath) {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  const bucket = storage.bucket();
  await bucket.upload(filePath, {
    destination: destinationPath
  });

  // Get public URL
  const file = bucket.file(destinationPath);
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '03-09-2025'
  });

  return url;
}
```

---

## Troubleshooting

### ❌ "serviceAccountKey.json not found"
- Check file is in project root
- Verify filename is exactly `serviceAccountKey.json` (case-sensitive)

### ❌ "Permission denied"
- Check Storage Rules in Firebase Console
- For development, use test mode rules (allow all)

### ❌ "Bucket not found"
- Verify Storage is enabled in Firebase Console
- Check project ID in service account key matches Firebase project

---

## Security Notes

1. ✅ `serviceAccountKey.json` is already in `.gitignore` - don't commit it!
2. 🔒 For production, use environment variables instead of file (see `FIREBASE_SETUP.md`)
3. 🔒 Update Storage Rules for production (restrict write access)

---

## Full Documentation

For detailed setup, examples, and production configuration, see:
- **`FIREBASE_SETUP.md`** - Complete guide with code examples
- **`test-firebase.js`** - Test script to verify connection

---

## Quick Test

After setup, run:
```bash
node test-firebase.js
```

Expected output:
```
✅ Firebase Storage initialized successfully!
📦 Bucket Name: your-project.appspot.com
📁 Testing file access...
   Found 0 file(s) in bucket
📤 Testing file upload...
   ✅ Test file created: test/test-1234567890.txt
   🗑️  Test file deleted (cleanup)
✅ All Firebase Storage tests passed!
```

---

**That's it!** Your hybrid system is now ready:
- ✅ Appwrite handles database
- ✅ Firebase handles file storage

