import { initializeApp } from 'firebase/app';
import { getDatabase, ref as dbRef, push } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"; 

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
export const generateResumeQuestions = httpsCallable(functions, 'generateResumeQuestions');
export const handleTextToSpeech = httpsCallable(functions, 'handleTextToSpeech');
export const saveResponse = httpsCallable(functions, 'saveResponse');
export const getInterviewResults = httpsCallable(functions, 'getInterviewResults');
export const verifyRecaptcha = httpsCallable(functions, 'verifyRecaptcha');
export const cleanupOldTier1Interviews = httpsCallable(functions, 'cleanupOldTier1Interviews');
export const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
export const stripeWebhook = httpsCallable(functions, 'stripeWebhook');
export const cancelSubscription = httpsCallable(functions, 'cancelSubscription');
export const uploadResume = httpsCallable(functions, 'uploadResume');
export default app;