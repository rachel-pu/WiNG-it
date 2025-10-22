"use client";
import { useState } from 'react';
import { supabase } from '../../../../../supabase.js'
import { motion } from 'framer-motion';
import { ArrowLeft} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import './Signup.css';
import { ref, set , get} from "firebase/database";
import {database} from '../../../../lib/firebase.jsx'
import bcrypt from 'bcryptjs';
import { Box, TextField, InputAdornment, IconButton, Button } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


const SignUp = () => {
  const [name, setName] = useState('');
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
  const isStrongPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleSignUp = async () => {
    setError('');

    if (!name.trim()) return setError('Please enter your name.');
    if (!isValidEmail(email)) return setError('Please use your email address.');
    if (!isStrongPassword(password))
      return setError(
        'Password must be at least 8 characters long and include upper and lower case letters, numbers, and special characters.'
      );

    try {
        const emailKey = email.replace(/\./g, '_');
        const userSnapshot = await get(ref(database, `userEmails/${emailKey}`));

        if (userSnapshot.exists())
            return setError('An account with this email already exists. Please sign in instead.');

        // Create a new user in Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/signin`,
            },
        });
        if (error) 
            throw error;

        const hashedPassword = await bcrypt.hash(password, 10);

        if (data?.user) {
            setError('A verification email has been sent. Please check your inbox.');
            await set(ref(database, `users/${data.user.id}`), {
                userId: data.user.id,
                personalInformation: {
                    fullName: name,
                    email: email,
                    password: hashedPassword,
                },
                academicInformation: {
                    bio: "",
                    schoolYear: "",
                    school: "",
                    major: "",
                    minor: "",
                },
                professionalInformation: {
                    currentJob: ""
                }
            });
            await set(ref(database, `userEmails/${emailKey}`), {
                userId: data.user.id,
            }); 
        }
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(err.message || 'An unexpected error occurred during sign up.');
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/signin`,
        },
      });

      if (error) throw error;
      if (data?.user) {
        await set(ref(database, `users/${data.user.id}`), {
          fullName: name,
          email: email,
          password: password,
          bio: "",
          userId: data.user.id,
          resume: "",
          schoolYear: "",
          school: "",
          major: "",
          minor: "",
          currentJob: ""
        });
      }
      console.log('Google OAuth initiated:', data);
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError(err.message || 'An error occurred during Google sign-up.');
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Start your journey with WiNG.it today</p>

            <motion.div variants={itemVariants}>
                <button className="google-sign-in-btn" onClick={handleGoogleSignUp}>
                    <span className="google-icon-modern"></span>
                    <span>Continue with Google</span>
                </button>
            </motion.div>

            <motion.div className="auth-divider" variants={itemVariants}>
                <span className="divider-line"></span>
                <span className="divider-text">or</span>
                <span className="divider-line"></span>
            </motion.div>

            {error && <div className="message-box error-box">{error}</div>}

            <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
                    <AccountCircle sx={{ color: '#94a3b8', mr: 1.5, my: 0.5, fontSize: 28 }} />
                    <TextField
                        fullWidth
                        label="Full Name"
                        variant="standard"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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

            <button className="primary-btn" onClick={handleSignUp}>
                Create Account
            </button>
            <p className="auth-description cursor-pointer" onClick={() => navigate("/signin")} style={{marginTop: 15}}>
              Have an account? Sign in.
            </p>
            <p className="privacy-term-text" style={{marginTop:25, marginBottom: 0}}> By signing up, you are agreeing to our</p>
            <p className="privacy-term-text" style={{marginTop: 0}}>
              <span className="auth-description cursor-pointer" onClick={() => navigate("/privacy")}> Privacy Policy</span> and {' '}
              <span className="auth-description cursor-pointer" onClick={() => navigate("/terms")}> Terms of Service</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
