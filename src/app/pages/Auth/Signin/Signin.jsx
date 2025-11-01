"use client";
import { useState } from 'react';
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

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
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
        </div>
    </div>
  );
};

export default SignIn;
