import fs from "fs";
import admin from "firebase-admin";

// Load service account key
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url), "utf-8")
);

// Initialize Firebase Admin with databaseURL
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wing-it-e6a3a-default-rtdb.firebaseio.com"
});

const db = admin.database();

export async function deleteUserById(userId) {
  console.log(`Deleting user: ${userId}`);

  try {
    // Delete interviews/{userId}
    await db.ref(`interviews/${userId}`).remove().catch(() => {});

    // Delete user info and get email
    const userRef = db.ref(`users/${userId}`);
    const userSnap = await userRef.once("value");
    const userData = userSnap.val();

    let email = null;
    if (userData) {
    email = userData.personalInformation?.email
        ? userData.personalInformation.email.replace(/\./g, "_")
        : null;
    
    await userRef.remove();
    }

    // Delete userEmails/{email}/{userId}
    if (email) {
      await db.ref(`userEmails/${email}/${userId}`).remove().catch(() => {});
    }

    // Delete userTiers/tier1/{userId}
    await db.ref(`userTiers/tier1/${userId}`).remove().catch(() => {});

    // Optionally, delete Firebase Authentication user
    await admin.auth().deleteUser(userId).catch(() => {});

    console.log(`Successfully deleted user ${userId}`);
    return { success: true, message: `User ${userId} deleted successfully.` };

  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
}

// Run script from CLI
const userId = process.argv[2];
if (!userId) {
  console.error("Usage: node deleteUserById.js <userId>");
  process.exit(1);
}

deleteUserById(userId).then(() => {
  console.log("Done.");
  process.exit(0);
});
