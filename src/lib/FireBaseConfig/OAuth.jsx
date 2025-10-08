// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

//more imports
import { getAuth } from 'firebase/auth'; // IF ERROR WITH FIREBASE, USE -> npm install firebase  --legacy-peer-deps
import { getDatabase, ref } from "firebase/database"; // Import if you're using Firebase Realtime Database
import { getStorage } from 'firebase/storage';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKz1-htIl9ie0euxmKHDyP4z7zLvt0uok",
  authDomain: "wicsepedia.firebaseapp.com",
  projectId: "wicsepedia",
  storageBucket: "wicsepedia.firebasestorage.app",
  messagingSenderId: "170297703197",
  appId: "1:170297703197:web:4c757982759496370afff4",
  measurementId: "G-BW9D517WJ5"
};


// Initialize Firebase

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const database = getDatabase(app); // If using Firebase Realtime Database
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null; // Conditional use of getAnalytics to avoid errors in non-browser environments

const db = getDatabase();
const dbRef = ref(db);

// Export the initialized Firebase services
const imageDb = getStorage(app)
export { app, auth, database, analytics, imageDb,  db, dbRef};
