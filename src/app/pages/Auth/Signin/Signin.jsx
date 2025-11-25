"use client";
import { useState, useEffect } from 'react';
import './Signin.css';
import { supabase } from '../../../../../supabase.js'
import { motion } from 'framer-motion';
import { ArrowLeft} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import {database} from '../../../../lib/firebase.jsx'
import { ref, get} from "firebase/database";
import { Button } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {Typography} from "@mui/material";

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY;

    useEffect(() => {
        const scriptId = "recaptcha-script";
        if (document.getElementById(scriptId)) return;

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
        script.async = true;
        script.defer = true;

        script.onload = () => {
          window.grecaptcha.ready(() => {
            window.grecaptcha.render("recaptcha-container", {
              sitekey: RECAPTCHA_SITE_KEY,
            });
          });
        };

        document.body.appendChild(script);
    }, []);

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const sanitizeInput = (input) => input.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, "");
    const isValidPassword = (password) => {
        const regex = /^[\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
        return password.length >= 8 && regex.test(password);
    };

    const handleSignIn = async () => {
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const token = await new Promise((resolve, reject) => {
            const check = () => {
                const gre = window.grecaptcha;
                if (gre && gre.ready && gre.execute) {
                    gre.ready(() => {
                    gre.execute(RECAPTCHA_SITE_KEY, { action: "signup" })
                        .then(resolve)
                        .catch(reject);
                    });
                } else {
                    setTimeout(check, 200);
                }
                };
                check();
            });

            const verificationResponse = await fetch(
                "https://us-central1-wing-it-e6a3a.cloudfunctions.net/verifyRecaptcha",
                {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
                }
            );

            const result = await verificationResponse.json();
            if (!result.success) throw new Error("Failed reCAPTCHA verification.");

            const sanitizedEmail = sanitizeInput(email.trim());
            const sanitizedPassword = sanitizeInput(password);
            if (!isValidEmail(sanitizedEmail)) return setError('Please enter a valid email address.');
            if (!sanitizedPassword.trim()) return setError('Please enter your password.');
            if (!isValidPassword(sanitizedPassword)) return setError('Password must be at least 8 characters and contain valid characters.');

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: sanitizedEmail,
                    password: sanitizedPassword,
                });
                if (error) throw error;

                const user = data.user;
                if (!user) throw new Error("No user returned after sign-in.");
                setError('Successfully signed in!');

                const userRef = ref(database, `users/${user.id}/onboardingCompleted`);
                const snapshot = await get(userRef);

                if (snapshot.exists() && snapshot.val() === true) {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            } catch (err) {
                console.error("Sign-in error:", err);
                if (err.message.includes("Invalid login credentials")) {
                    setError("Invalid email or password. Please try again.");
                } else {
                    setError(err.message || "An unexpected error occurred during sign-in.");
                }
            }
        } catch (err) {
            console.error("reCAPTCHA execution error:", err);
            setError("Could not verify reCAPTCHA. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleForgotPassword = async (email) => {
        setError('');
        setSuccess('');
        if (! email){
            setError("Please enter your email address to reset your password");
        }else {
            try {
                const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/update-password`,
                });
                if (error) throw error;
                setSuccess("Sent password reset link");
            } catch (err) {
                console.error('Error sending password reset email:', err.message);
                setError("Failed to send password reset link");
            }
        }
    };


    return (
        <div className="auth-page">
            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Left Side - Gradient Section */}
                <div className="auth-left">
                    <div className="logo-section">
                        <img src="/static/icons/logos/white-wingit.png" alt="WiNG.it Logo" className="logo-image" />
                        <h1 className="logo-text">WiNG.it</h1>
                    </div>

                    <div className="auth-left-content">
                        <div className="message-section">
                            <p className="message-intro">Jump back into</p>
                            <h2 className="message-main">Your new professional tool haven</h2>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Section */}
                <div className="auth-right">
                    <Button
                        onClick={() => navigate('/')}
                        className="back-button-right"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                        <span>Back to Home</span>
                    </Button>

                    <div className="auth-form-container">
                        <div className="auth-header">
                            <h1 className="auth-title">Welcome Back</h1>
                            <p className="auth-subtitle">Sign in to continue your interview prep</p>
                        </div>

                        {error && <div className="message-box error-box">{error}</div>}
                        {success && <div className="message-box success-box">{success}</div>}

                        <div className="auth-form">
                            <motion.div variants={itemVariants} className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <EmailIcon className="input-icon" />
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="form-group">
                                <div className="label-row">
                                    <label className="form-label">Password</label>
                                    <button
                                        type="button"
                                        className="forgot-link"
                                        onClick={() => handleForgotPassword(email)}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="input-wrapper">
                                    <LockIcon className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </button>
                                </div>
                            </motion.div>

                            <button className="primary-btn" onClick={handleSignIn} disabled={isLoading}>
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </div>

                        <div className="auth-footer">
                            <p className="footer-text">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    className="link-btn"
                                    onClick={() => navigate("/signup")}
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>

                        <Typography
                            component="small"
                            className="recaptcha-text"
                        >
                            This site is protected by reCAPTCHA and the Google{' '}
                            <a
                                href="https://policies.google.com/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Privacy Policy
                            </a>{' '}
                            and{' '}
                            <a
                                href="https://policies.google.com/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Terms of Service
                            </a>{' '}
                            apply.
                        </Typography>
                    </div>
                </div>
            </motion.div>
            <div id="recaptcha-container" style={{display:'none'}}></div>
        </div>
    );
};

export default SignIn;
