"use client";
import { useState, useEffect } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import './Signin.css';
import HomePageNavbar from "../../../components/HomePageNavbar";
import { supabase } from '../../../../supabase.js'
import { motion } from 'framer-motion';
import { GoogleUserAuth } from '../../../lib/FireBaseConfig/AuthContext.jsx';
import { Mail, Lock, Eye, EyeOff, User} from 'lucide-react';

const SignIn = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const auth = getAuth();
    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
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
        } catch (err) {
        console.error("Sign-up error:", err);
        setError(err.message);
        }
    };

    const handleGoogleSignInClick = async () => {
        setError('');
        setSuccessMessage('');
        
        try {
            const result = await googleSignIn();
            if (!result?.user) {
                setError('No user data received. Please try again.');
                return;
            }
        } catch (error) {
            console.error("Google sign in error:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                setError('Sign in was cancelled. Please try again.');
            } else {
                setError('An error occurred during sign-in. Please try again.');
            }
        }
    };


    return (
        <div>
            <HomePageNavbar/>
            <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <motion.div variants={itemVariants}>
                <button className="google-sign-in-btn" onClick={handleGoogleSignInClick}>
                    <span className="google-icon-modern"></span>
                    <span>Continue with Google</span>
                </button>
                </motion.div>

                {/* Divider */}
                <motion.div className="auth-divider" variants={itemVariants}>
                <span className="divider-line"></span>
                <span className="divider-text">or</span>
                <span className="divider-line"></span>
                </motion.div>

                {error && <div className="message-box error-box">{error}</div>}

                <motion.div className="input-group" variants={itemVariants}>
                    <label className="input-label">Full Name</label>
                    <div className="input-wrapper">
                        <User className="input-icon" />
                        <input 
                        type="email" 
                        className="modern-input" 
                        placeholder="       John Doe" 
                        value={email}
                        onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </motion.div>
                
                <motion.div className="input-group" variants={itemVariants}>
                    <label className="input-label">Email address</label>
                    <div className="input-wrapper">
                        <Mail className="input-icon" />
                        <input 
                        type="email" 
                        className="modern-input" 
                        placeholder="       you@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </motion.div>

                <motion.div className="input-group" variants={itemVariants}>
                    <label className="input-label">Password</label>
                    <div className="input-wrapper">
                        <Lock className="input-icon" />
                        <input 
                        type={showPassword ? "text" : "password"}
                        className="modern-input password-input-field" 
                        placeholder="       Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </motion.div>


                <button className="primary-btn" onClick={handleSignIn}>
                    Continue
                </button>
            </div>
        </div>
    </div>
  );
};

export default SignIn;
