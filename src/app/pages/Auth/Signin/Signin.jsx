"use client";
import { useState, useEffect } from 'react';
import './Signin.css';
import { supabase } from '../../../../../supabase.js'
import { motion } from 'framer-motion';
import { ArrowLeft} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import {database} from '../../../../lib/firebase.jsx'
import { ref, get} from "firebase/database";
import { Box, TextField, InputAdornment, IconButton, Button } from '@mui/material';
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
        // Must be at least 8 characters, alphanumeric + special characters
        const regex = /^[\w!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
        return password.length >= 8 && regex.test(password);
    };

    const handleSignIn = async () => {
        setError('');

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

            // Verify the token with your backend
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
        }
    };


    const handleForgotPassword = async (email) => {
        if (! email){
            setError("Please enter your email address to reset your password");
        }else {
            try {
                const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/update-password`,
                });
                if (error) throw error;
                setError("Sent password reset link");
            } catch (err) {
                console.error('Error sending password reset email:', err.message);
            }
        }
    };


    return (
        <div>
            <div className="auth-page">
                <div className="auth-card">
                    <Button
                        onClick={() => navigate('/')}
                        sx={{
                        position: 'absolute',
                        top: '-35px',
                        left: '0',
                        color: '#cacacaff',
                        minWidth: 'auto',
                        padding: '2px 4px',
                        backgroundColor: 'transparent',
                        textTransform: 'none',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '13px',
                        fontWeight: 500,
                        gap: '6px',
                        '&:hover': {
                            color: '#a5b7f9ff'
                        },
                        transition: 'all 0.2s ease',
                        zIndex: 10
                    }}
                        >
                        <ArrowLeft size={16} strokeWidth={2.5} />
                        <span>Back to Home</span>
                    </Button>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to continue to WiNG.it</p>

                    {error && <div className="message-box error-box">{error}</div>}

                    <motion.div variants={itemVariants}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
                            <EmailIcon sx={{ color: '#94a3b8', mr: 1.5, my: 0.5, fontSize: 28 }} />
                            <TextField
                                fullWidth
                                label="Email Address"
                                variant="standard"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{
                                    '& .MuiInputLabel-root': {
                                        fontFamily: 'Satoshi Bold, sans-serif',
                                        color: '#94a3b8',
                                        fontSize: '14px'
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#2850d9'
                                    },
                                    '& .MuiInput-root': {
                                        fontFamily: 'DM Sans, sans-serif',
                                        fontSize: '16px',
                                        color: '#1a202c'
                                    },
                                    '& .MuiInput-underline:before': {
                                        borderBottomColor: '#e2e8f0',
                                        borderBottomWidth: '2px'
                                    },
                                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                                        borderBottomColor: '#cbd5e1',
                                        borderBottomWidth: '2px'
                                    },
                                    '& .MuiInput-underline:after': {
                                        borderBottomColor: '#2850d9',
                                        borderBottomWidth: '2px'
                                    }
                                }}
                            />
                        </Box>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
                            <LockIcon sx={{ color: '#94a3b8', mr: 1.5, my: 0.5, fontSize: 28 }} />
                            <TextField
                                fullWidth
                                label="Password"
                                variant="standard"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                                sx={{ color: '#64748b' }}
                                            >
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiInputLabel-root': {
                                        fontFamily: 'Satoshi Bold, sans-serif',
                                        color: '#94a3b8',
                                        fontSize: '14px'
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#2850d9'
                                    },
                                    '& .MuiInput-root': {
                                        fontFamily: 'DM Sans, sans-serif',
                                        fontSize: '16px',
                                        color: '#1a202c'
                                    },
                                    '& .MuiInput-underline:before': {
                                        borderBottomColor: '#e2e8f0',
                                        borderBottomWidth: '2px'
                                    },
                                    '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                                        borderBottomColor: '#cbd5e1',
                                        borderBottomWidth: '2px'
                                    },
                                    '& .MuiInput-underline:after': {
                                        borderBottomColor: '#2850d9',
                                        borderBottomWidth: '2px'
                                    }
                                }}
                            />
                        </Box>
                    </motion.div>


                    <button className="primary-btn" onClick={handleSignIn}>
                        Log In
                    </button>
                    <p
                    className="auth-description cursor-pointer"
                    style={{ marginTop: 10 }}
                    onClick={() => handleForgotPassword(email)}
                    >
                    Forgot Password
                    </p>
                    <p
                    className="auth-description cursor-pointer"
                    style={{ marginTop: 10 }}
                    onClick={() => navigate("/signup")}
                    >
                    Don't have an account? Sign up instead.
                    </p>
                </div>
                <Typography
                    component="small"
                    sx={{
                        display: 'block',
                        marginTop: '10px',
                        fontSize: '0.75rem',
                        color: '#dddadaff',
                        textAlign: 'center'
                    }}
                >
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a
                        href="https://policies.google.com/privacy"
                        style={{ color: '#b7c8f9ff' }}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                    Privacy Policy
                    </a>{' '}

                    and{' '}
                    <a
                        href="https://policies.google.com/terms"
                        style={{ color: '#b7c8f9ff' }}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                    Terms of Service
                    </a>{' '}
                    apply.
                </Typography>
                <div id="recaptcha-container" style={{display:'none'}}></div>
            </div>
        </div>
    );
};

export default SignIn;
