"use client";
import { useState, useEffect } from 'react';
import { getAuth, signOut, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set, update, get } from 'firebase/database';
import './Signin.css';
import app from "../../../lib/firebase.jsx";
import HomePageNavbar from "../../../components/HomePageNavbar";
import { supabase } from '../../../../supabase.js'

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [verificationCheckInterval, setVerificationCheckInterval] = useState(null);
  const [pendingUserId, setPendingUserId] = useState(null);

  const auth = getAuth();
  const db = getDatabase();

  const escapeEmail = (email) => email.replace(/\./g, ',');

  const startVerificationCheck = (user) => {
    if (verificationCheckInterval) clearInterval(verificationCheckInterval);

    setPendingUserId(user.uid);

    const interval = setInterval(async () => {
      try {
        if (auth.currentUser) {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            clearInterval(interval);
            await updateEmailVerificationStatus(pendingUserId);
            setError('Email verified! You can now sign in.');
          }
        }
      } catch (err) {
        console.error("Error checking email verification:", err);
      }
    }, 3000);

    setVerificationCheckInterval(interval);
  };

  const updateEmailVerificationStatus = async (userId) => {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      await update(userRef, { ...snapshot.val(), emailVerified: true });
    }
  };

  const writeUserData = async (userId, name, email) => {
    await set(ref(db, `users/${userId}`), {
      username: name,
      email,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    });
    await set(ref(db, `emailToUid/${escapeEmail(email)}`), userId);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.emailVerified) await signOut(auth);
    });
    return () => unsubscribe();
  }, [auth]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleSignIn = async () => {
    if (!name.trim()) return setError('Please enter your name.');
    if (!isValidEmail(email)) return setError('Please use your email address.');
    if (!isStrongPassword(password))
      return setError(
        'Password must be at least 8 characters long and include upper and lower case letters, numbers, and special characters.'
      );

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        console.log('User logged in:', data);
        setError(error)
        //   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        //   if (userCredential.user) {
        // const userId = userCredential.user.uid;
        // await writeUserData(userId, name, email);
        //     await sendEmailVerification(userCredential.user);
        // setEmailSent(true);
        // startTimer();
        // startVerificationCheck(userCredential.user);
        // setError('A verification email has been sent. Please check your email to verify.');
        // setPendingUserId(userId);
        // await signOut(auth);
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(err.message);
    }
  };

  const resendEmailVerification = async () => {
    if (auth.currentUser && !resendDisabled) {
      await sendEmailVerification(auth.currentUser);
      startTimer();
      setError('A new verification email has been sent. Please check your inbox.');
    }
  };

  const startTimer = () => {
    setResendDisabled(true);
    setTimer(40);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  return (
    <div>
        <HomePageNavbar/>
        <div className="auth-page">
        <div className="auth-card">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-description">Start preparing for your next interview! Sign up with your email to continue.</p>

            {error && <div className="message-box error-box">{error}</div>}

            <input
            type="text"
            className="modern-input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            />
            <input
            type="email"
            className="modern-input"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <div className="input-wrapper">
            <input
                type={showPassword ? 'text' : 'password'}
                className="modern-input password-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? 'Hide' : 'Show'}
            </button>
            </div>

            {emailSent ? (
            <button className="primary-btn" onClick={resendEmailVerification} disabled={resendDisabled}>
                Resend Email Verification ({timer}s)
            </button>
            ) : (
            <button className="primary-btn" onClick={handleSignIn}>
                Continue
            </button>
            )}
        </div>
    </div>
    </div>
  );
};

export default SignUp;
