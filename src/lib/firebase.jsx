import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const functions = getFunctions(app);
export const storage = getStorage(app); 

// Callable functions
export const generateQuestions = httpsCallable(functions, 'generateQuestions');
export const handleTextToSpeech = httpsCallable(functions, 'handleTextToSpeech');
export const saveResponse = httpsCallable(functions, 'saveResponse');
export const getInterviewResults = httpsCallable(functions, 'getInterviewResults');
export async function uploadResume(userId, file) {
  try {
    if (file.type !== "application/pdf") {
      throw new Error("Only PDF files are allowed.");
    }
    const storage = getStorage();
    const resumeRef = ref(storage, `resumes/${userId}/${userId}.pdf`);

    await uploadBytes(resumeRef, file);

    // Get the public URL
    const downloadURL = await getDownloadURL(resumeRef);
    return downloadURL;

  } catch (error) {
    console.error("Error uploading resume:", error);
    throw error;
  }
}
export default app;