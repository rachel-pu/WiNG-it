import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';

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

// Callable functions
export const generateQuestions = httpsCallable(functions, 'generateQuestions');
export const textToSpeech = httpsCallable(functions, 'textToSpeech');
export const saveResponse = httpsCallable(functions, 'saveResponse');
export const getInterviewResults = httpsCallable(functions, 'getInterviewResults');
export default app;