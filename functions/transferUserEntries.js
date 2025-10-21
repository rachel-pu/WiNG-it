import { ref, get, set } from "firebase/database";
import {app, database} from "../src/lib/firebase"

/**
 * Copies all entries from one user to another
 * @param {string} sourceUid - The UID of the user to copy from
 * @param {string} targetUid - The UID of the user to copy to
 */
async function copyEntries(sourceUid, targetUid) {
  try {
    const sourceRef = ref(database, `interviews/${sourceUid}`);
    const snapshot = await get(sourceRef);

    if (!snapshot.exists()) {
      console.log(`No entries found for user ${sourceUid}`);
      return;
    }

    const entries = snapshot.val();
    const targetRef = ref(database, `interviews/${targetUid}`);

    // Write entire object to target user
    await set(targetRef, entries);

    console.log(`Successfully copied ${Object.keys(entries).length} entries from ${sourceUid} → ${targetUid}`);
  } catch (error) {
    console.error("Error copying entries:", error);
  }
}

const [,, sourceUid, targetUid] = process.argv;
if (!sourceUid || !targetUid) {
  process.exit(1);
}

copyEntries(sourceUid, targetUid);
