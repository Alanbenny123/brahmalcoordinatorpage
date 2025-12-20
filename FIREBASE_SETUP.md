# 🔥 Firebase Storage Setup Guide

## Overview

Your system uses a **hybrid architecture**:
- **Appwrite** → Database (events, tickets, attendance, users, etc.)
- **Firebase Storage** → File storage (photos, certificates, QR codes, banners)

Firebase Storage is **optional** for basic functionality but **required** for:
- Event photos and banners
- Auto-generated certificates
- QR code images
- Document storage

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter project name (e.g., "Brahma Fest")
4. Enable/disable Google Analytics (optional)
5. Click **"Create project"**
6. Wait for project creation to complete

---

## Step 2: Enable Firebase Storage

1. In your Firebase project, go to **"Storage"** in the left sidebar
2. Click **"Get started"**
3. Choose **"Start in production mode"** (or test mode for development)
4. Select a **Cloud Storage location** (choose closest to your users)
5. Click **"Done"**

**Storage Rules (Production Mode):**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**For Development (Test Mode):**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

---

## Step 3: Create Storage Buckets (Optional but Recommended)

Organize your storage with folders:

```
your-bucket/
├── events/
│   ├── photos/
│   └── banners/
├── certificates/
├── qr-codes/
└── documents/
```

You can create these folders programmatically or through the Firebase Console.

---

## Step 4: Generate Service Account Key

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Go to the **"Service accounts"** tab
4. Click **"Generate new private key"**
5. Click **"Generate key"** in the confirmation dialog
6. A JSON file will download (e.g., `brahma-fest-firebase-adminsdk-xxxxx.json`)

**⚠️ IMPORTANT:** This file contains sensitive credentials. Never commit it to Git!

---

## Step 5: Configure Service Account Key

1. **Rename the downloaded file** to `serviceAccountKey.json`
2. **Move it to your project root** (same directory as `server.js`)

```
brahma_coordinor/
├── server.js
├── appwrite.js
├── firebase.js
├── serviceAccountKey.json  ← Place it here
├── package.json
└── ...
```

3. **Verify the file structure** - it should look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## Step 6: Update .gitignore (Important!)

Make sure `serviceAccountKey.json` is in your `.gitignore`:

```gitignore
# Environment variables
.env
.env.local

# Firebase
serviceAccountKey.json
*-firebase-adminsdk-*.json

# Node modules
node_modules/
```

---

## Step 7: Test Firebase Connection

1. **Start your server:**
   ```bash
   npm start
   ```

2. **Check the console output:**
   - ✅ If you see: `✅ Firebase Storage initialized` → Success!
   - ⚠️ If you see: `⚠️ Firebase serviceAccountKey.json not found` → Check file location
   - ❌ If you see an error → Check the error message

---

## Step 8: Verify Storage Access

Create a test script to verify Firebase Storage is working:

**Create `test-firebase.js`:**
```javascript
const { storage } = require('./firebase');

async function testFirebase() {
  if (!storage) {
    console.error('❌ Firebase Storage not initialized');
    return;
  }

  try {
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ maxResults: 1 });
    console.log('✅ Firebase Storage connection successful!');
    console.log(`📦 Bucket: ${bucket.name}`);
    console.log(`📁 Files found: ${files.length}`);
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error.message);
  }
}

testFirebase();
```

**Run the test:**
```bash
node test-firebase.js
```

---

## Step 9: Storage Bucket Configuration (Optional)

If you want to specify a custom bucket name, you can modify `firebase.js`:

```javascript
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'your-custom-bucket-name.appspot.com' // Optional
});
```

By default, Firebase uses: `{project-id}.appspot.com`

---

## Usage in Your Code

### Upload a File to Firebase Storage

```javascript
const { storage } = require('./firebase');

async function uploadFile(filePath, destinationPath) {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }

  const bucket = storage.bucket();
  await bucket.upload(filePath, {
    destination: destinationPath,
    metadata: {
      contentType: 'image/jpeg', // or 'application/pdf', etc.
    }
  });

  // Get public URL
  const file = bucket.file(destinationPath);
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '03-09-2025' // Set expiration date
  });

  return url;
}
```

### Example: Upload Event Photo

```javascript
// Upload event photo
const photoUrl = await uploadFile(
  './uploads/event-photo.jpg',
  'events/photos/event-123.jpg'
);

// Save URL to Appwrite
await databases.updateDocument(
  DATABASE_ID,
  COLLECTIONS.EVENTS,
  eventId,
  { photoUrl: photoUrl }
);
```

### Example: Generate and Upload Certificate

```javascript
const { storage } = require('./firebase');
const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generateCertificate(studentName, eventName) {
  // Generate PDF
  const doc = new PDFDocument();
  const filename = `cert-${Date.now()}.pdf`;
  doc.pipe(fs.createWriteStream(filename));
  
  // Add certificate content
  doc.text(`Certificate of Participation`, { align: 'center' });
  doc.text(`This certifies that ${studentName}`, { align: 'center' });
  doc.text(`participated in ${eventName}`, { align: 'center' });
  doc.end();

  // Upload to Firebase
  const bucket = storage.bucket();
  await bucket.upload(filename, {
    destination: `certificates/${studentName}-${eventName}.pdf`
  });

  // Get public URL
  const file = bucket.file(`certificates/${studentName}-${eventName}.pdf`);
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '03-09-2025'
  });

  // Clean up local file
  fs.unlinkSync(filename);

  return url;
}
```

---

## Troubleshooting

### ❌ "Firebase serviceAccountKey.json not found"
**Solution:**
- Check file is in project root (same folder as `server.js`)
- Verify filename is exactly `serviceAccountKey.json` (case-sensitive)
- Check file permissions

### ❌ "Error: Could not load the default credentials"
**Solution:**
- Verify service account key JSON is valid
- Check `project_id` matches your Firebase project
- Ensure private key is properly formatted (with `\n` characters)

### ❌ "Permission denied" when uploading
**Solution:**
- Check Storage Rules in Firebase Console
- Verify service account has Storage Admin role
- For production, update rules to allow authenticated writes

### ❌ "Bucket not found"
**Solution:**
- Verify bucket name in service account key matches your project
- Check Firebase project ID is correct
- Ensure Storage is enabled in Firebase Console

---

## Security Best Practices

1. **Never commit `serviceAccountKey.json` to Git**
   - Already in `.gitignore` ✅
   - Use environment variables for production

2. **Use environment variables for production:**
   ```javascript
   // Instead of file, use environment variables
   admin.initializeApp({
     credential: admin.credential.cert({
       projectId: process.env.FIREBASE_PROJECT_ID,
       privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
       clientEmail: process.env.FIREBASE_CLIENT_EMAIL
     })
   });
   ```

3. **Restrict Storage Rules:**
   - Use production rules in production
   - Only allow authenticated uploads
   - Validate file types and sizes

4. **Rotate keys regularly:**
   - Generate new service account keys periodically
   - Revoke old keys

---

## Next Steps

1. ✅ Firebase Storage is set up
2. ✅ Test the connection
3. 📝 Implement file upload endpoints in `server.js`
4. 📝 Add certificate generation logic
5. 📝 Update event creation to handle photo uploads

---

## Quick Reference

**Firebase Console:** https://console.firebase.google.com/
**Storage Documentation:** https://firebase.google.com/docs/storage
**Admin SDK Docs:** https://firebase.google.com/docs/admin/setup

---

**Need Help?** Check the server console for detailed error messages when Firebase fails to initialize.

