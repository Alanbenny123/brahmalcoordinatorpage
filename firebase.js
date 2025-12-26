const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// NOTE: Firebase is now used ONLY for storage (photos, certificates, QR codes)
// Database operations have been migrated to Appwrite

let storage = null;

try {
  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    storage = admin.storage();
    console.log("✅ Firebase Storage initialized");
  } else {
    console.warn("⚠️  Firebase serviceAccountKey.json not found. Firebase Storage will not be available.");
    console.warn("   This is optional - the app will work without Firebase for basic functionality.");
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error.message);
  console.warn("⚠️  Firebase Storage will not be available.");
}

module.exports = { storage };
