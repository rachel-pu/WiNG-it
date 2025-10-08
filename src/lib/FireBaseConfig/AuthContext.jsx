import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from './OAuth.jsx';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      // Configure Google provider to select account every time
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // First get the email without signing in
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      return result;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign in was cancelled. Please try again.');
      }
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    googleSignIn
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const GoogleUserAuth = () => {
  return useContext(AuthContext);
};