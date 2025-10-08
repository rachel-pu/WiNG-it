"use client";
import { useState, useEffect } from 'react';
import { getAuth, signOut, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set, update, get } from 'firebase/database';
import './Signin.css';
import { GoogleUserAuth } from '../../../lib/FireBaseConfig/AuthContext';

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
    const { googleSignIn: originalGoogleSignIn } = GoogleUserAuth();
    // const navigate = useNavigate();
    const auth = getAuth();
    const db = getDatabase();

    const escapeEmail = (email) => {
        return email.replace(/\./g, ',');
    };

    const googleSignIn = async () => {
        try {
            const result = await originalGoogleSignIn();
            if (!result?.user) {
                setError('No user data received. Please try again.');
                return;
            }

            const userId = result.user.uid;
            const userRef = ref(db, `users/${userId}`);
            
            // Check if user already exists in database
            const snapshot = await get(userRef);
            if (!snapshot.exists()) {
                // If new user, write their data
                await writeUserData(userId, result.user.displayName || 'User', result.user.email);
            }

            // If email not verified, send verification
            if (!result.user.emailVerified) {
                await sendEmailVerification(result.user);
                setEmailSent(true);
                startTimer();
                setPendingUserId(userId);
                startVerificationCheck(result.user);
                setError('Please verify your email address before signing in.');
                await signOut(auth);
            } else {
                await updateEmailVerificationStatus(userId);
                // navigate('/'); // or wherever you want verified users to go
            }
        } catch (error) {
            console.error("Error during Google sign in:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                setError('Sign in was cancelled. Please try again.');
            } else {
                setError('An error occurred during sign in. Please try again.');
            }
            await signOut(auth);
        }
    };

    const startVerificationCheck = (user) => {
        if (verificationCheckInterval) {
            clearInterval(verificationCheckInterval);
        }

        setPendingUserId(user.uid);

        const interval = setInterval(async () => {
            try {
                if (auth.currentUser) {
                    await auth.currentUser.reload();
                    if (auth.currentUser.emailVerified) {
                        clearInterval(interval);
                        await updateEmailVerificationStatus(pendingUserId);
                        setError('Email verified! You can now sign in.');
                        // navigate('/userAuth');
                    }
                } else {
                    const userRef = ref(db, `users/${pendingUserId}`);
                    const snapshot = await get(userRef);
                    if (snapshot.exists() && snapshot.val().emailVerified) {
                        clearInterval(interval);
                        setError('Email verified! You can now sign in.');
                        // navigate('/userAuth');
                    }
                }
            } catch (error) {
                console.error("Error checking email verification:", error);
            }
        }, 3000);

        setVerificationCheckInterval(interval);
    };

    useEffect(() => {
        return () => {
            if (verificationCheckInterval) {
                clearInterval(verificationCheckInterval);
            }
        };
    }, [verificationCheckInterval]);

    const updateEmailVerificationStatus = async (userId) => {
        try {
            const userRef = ref(db, `users/${userId}`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const userData = snapshot.val();
                await update(userRef, {
                    ...userData,
                    emailVerified: true
                });
            }
        } catch (error) {
            console.error("Error updating email verification status:", error);
            throw error;
        }
    };

    const writeUserData = async (userId, name, email) => {
        try {
            await set(ref(db, `users/${userId}`), {
                username: name,
                email: email,
                emailVerified: false,
                createdAt: new Date().toISOString()
            });
            await set(ref(db, `emailToUid/${escapeEmail(email)}`), userId);
        } catch (error) {
            console.error("Error writing user data:", error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && !currentUser.emailVerified) {
                await signOut(auth);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isStrongPassword = (password) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    };

    const handleSignUp = async () => {
        if (!name.trim()) {
            setError('Please enter your name.');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Please use your email address.');
            return;
        }
        if (!isStrongPassword(password)) {
            setError('Password must be at least 8 characters long and include upper and lower case letters, numbers, and special characters.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                const userId = userCredential.user.uid;
                await writeUserData(userId, name, email);
                await sendEmailVerification(userCredential.user);
                setEmailSent(true);
                startTimer();
                startVerificationCheck(userCredential.user);
                setError('A verification email has been sent. Please check your email to verify.');
                setPendingUserId(userId);
                await signOut(auth);
            }
        } catch (error) {
            console.error("Error during sign-up: ", error);
            setError(error.message);
        }
    };

    const resendEmailVerification = async () => {
        if (auth.currentUser && !resendDisabled) {
            try {
                await sendEmailVerification(auth.currentUser);
                startTimer();
                setError('A new verification email has been sent. Please check your inbox.');
            } catch (error) {
                console.error("Error resending verification email:", error);
                setError('Error sending verification email. Please try again later.');
            }
        }
    };

    const startTimer = () => {
        setResendDisabled(true);
        setTimer(40);
        const interval = setInterval(() => {
            setTimer(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(interval);
                    setResendDisabled(false);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        return () => {
            if (verificationCheckInterval) {
                clearInterval(verificationCheckInterval);
            }
        };
    }, [verificationCheckInterval]);

    return (
        <div className="authbody">
            <div className="card">
                <h1 className='h1style1'>Sign Up</h1>
                <p className='pstyle1'>Start preparing for your next interview! Sign up with your email to continue.</p>
                <div className='continueWithGoogle'>
                    <button className="google-btn" onClick={googleSignIn}>
                        <span className="google-icon"></span>
                        Sign Up with Google
                    </button>
                </div>
                <p id='centerText' className='pstyle1'>or</p>
                {error && <p className="error">{error}</p>}
                <input 
                    type="text"
                    className="input-field"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input 
                    type="email"
                    className="input-field"
                    placeholder="Enter Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <div className="password-container">
                    <input 
                        type={showPassword ? "text" : "password"}
                        className="input-field password-input"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="toggle-password"
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
                {emailSent ?
                    <button className="continue-btn" onClick={resendEmailVerification} disabled={resendDisabled}>
                        Resend Email Verification ({timer}s)
                    </button> :
                    <button className="continue-btn" onClick={handleSignUp}>Continue</button>
                }

                {/* <Link to="/userAuth" className="link-text">Already have an account? Sign in</Link> */}
            </div>
        </div>
    );
};

export default SignUp;