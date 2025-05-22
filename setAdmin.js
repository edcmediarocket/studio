const admin = require("firebase-admin");

// Use a service account key or application default credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault(), // Or use cert() with a JSON service account
});

const uid = "5LBf6CZydDZHXctKBBOl9CeZ2QV2";

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Admin claim successfully set for UID: ${uid}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed to set admin claim:", error);
    process.exit(1);
  });
