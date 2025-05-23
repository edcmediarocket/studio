
const admin = require("firebase-admin");

// Use a service account key or application default credentials
// Ensure your service account key JSON file is correctly referenced here if not using application default.
// For example: const serviceAccount = require("./path/to/your/serviceAccountKey.json");
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

admin.initializeApp({
  credential: admin.credential.applicationDefault(), // Or use cert() with a JSON service account
});

const uidsToMakeAdmin = [
  "5LBf6CZydDZHXctKBBOl9CeZ2QV2",
  "xCyY0zaCW8bcFWN8Uru06NelIcS2"
];

async function setAdminClaims() {
  let allSuccessful = true;
  for (const uid of uidsToMakeAdmin) {
    try {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
      console.log(`✅ Admin claim successfully set for UID: ${uid}`);
      
      // Optional: Verify by fetching the user record
      // const userRecord = await admin.auth().getUser(uid);
      // console.log('Updated user claims:', userRecord.customClaims);

    } catch (error) {
      console.error(`❌ Failed to set admin claim for UID: ${uid}`, error);
      allSuccessful = false;
    }
  }

  if (allSuccessful) {
    console.log("All admin claims processed successfully.");
    process.exit(0);
  } else {
    console.log("One or more admin claims failed to process.");
    process.exit(1);
  }
}

setAdminClaims();
