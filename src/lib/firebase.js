import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "wing-it-e6a3a.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: "wing-it-e6a3a",
  storageBucket: "wing-it-e6a3a.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const functions = getFunctions(app);

// Callable functions
export const generateQuestions = httpsCallable(functions, 'generateQuestions');
export const textToSpeech = httpsCallable(functions, 'textToSpeech');
export const saveResponse = httpsCallable(functions, 'saveResponse');
export const getInterviewResults = httpsCallable(functions, 'getInterviewResults');