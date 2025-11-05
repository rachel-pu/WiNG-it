"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../../../supabase.js';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import './Signup.css';
import { ref, set, get } from "firebase/database";
import { database } from '../../../../lib/firebase.jsx';
import bcrypt from 'bcryptjs';
import { Box, TextField, InputAdornment, IconButton, Button } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {Typography} from "@mui/material";


const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    const scriptId = "recaptcha-script";
    if (document.getElementById(scriptId)) return;
    console.log("Recaptcha Key:", RECAPTCHA_SITE_KEY);

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

  // Validation functions
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStrongPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  const sanitizeInput = (input) => input.replace(/[\0\x08\x09\x1a\n\r"'\\<>%]/g, "");


  const handleSignUp = async () => {
    setError("");

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

      // Continue with Supabase / Firebase user creation
      const sanitizedName = sanitizeInput(name.trim());
      const sanitizedEmail = sanitizeInput(email.trim());
      const sanitizedPassword = sanitizeInput(password);

      // Input validation
      if (!sanitizedName) return setError('Please enter your name.');
      if (!isValidEmail(sanitizedEmail)) return setError('Please enter a valid email address.');
      if (!isStrongPassword(sanitizedPassword))
        return setError(
          'Password must be at least 8 characters long and include upper/lowercase letters, numbers, and special characters.'
        );

      try {
        // Check if email already exists in Firebase
        const emailKey = sanitizedEmail.replace(/\./g, '_');
        const userSnapshot = await get(ref(database, `userEmails/${emailKey}`));
        if (userSnapshot.exists())
          return setError('An account with this email already exists. Please sign in instead.');

        // Create new user in Supabase
        const { data, error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password: sanitizedPassword,
          options: {
            data: { 
              name: sanitizedName,
              onboarded: false
            },
            emailRedirectTo: `${window.location.origin}/onboarding`
          },
        });
        if (error) throw error;

        const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);
        const passwordLength = sanitizedPassword.length;

        if (data?.user) {
          setError('A verification email has been sent. Please check your inbox.');

          // Save user info in Firebase
          await set(ref(database, `users/${data.user.id}`), {
            userId: data.user.id,
            passwordLength,
            personalInformation: {
              fullName: sanitizedName,
              email: sanitizedEmail,
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
            },
            notificationPreferences: {}
          });

        // Store email lookup
        await set(ref(database, `userEmails/${emailKey}`), {
          userId: data.user.id,
        });
      }
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(err.message || 'An unexpected error occurred during sign up.');
    }

  } catch (err) {
    console.error("reCAPTCHA execution error:", err);
    setError("Could not verify reCAPTCHA. Please try again.");
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
              '&:hover': { color: '#a5b7f9ff' },
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span>Back to Home</span>
          </Button>

          <h1 className="auth-title">Create Account</h1>

          <p className="auth-subtitle">Start your journey with WiNG.it today</p>

          {error && <div className="message-box error-box">{error}</div>}

          {/* Name Input */}
          <motion.div variants={itemVariants}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 3 }}>
              <AccountCircle sx={{ color: '#94a3b8', mr: 1.5, my: 0.5, fontSize: 28 }} />
              <TextField
                fullWidth
                label="Full Name"
                variant="standard"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Box>
          </motion.div>

          {/* Email Input */}
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
              />
            </Box>
          </motion.div>

          {/* Password Input */}
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
              />
            </Box>
          </motion.div>

          <button className="primary-btn" onClick={handleSignUp}>
            Create Account
          </button>

          <p className="auth-description cursor-pointer" onClick={() => navigate("/signin")} style={{ marginTop: 15 }}>
            Have an account? Sign in.
          </p>
          <p className="privacy-term-text" style={{marginTop:25, marginBottom: 0}}> By signing up, you are agreeing to our</p>
            <p className="privacy-term-text" style={{marginTop: 0}}>
              <span 
                className="auth-description cursor-pointer" 
                onClick={() => navigate("/privacy", { state: { previousRoute: window.location.pathname } })}
              >
                Privacy Policy
              </span> 
              and{' '}
              <span 
                className="auth-description cursor-pointer" 
                onClick={() => navigate("/terms", { state: { previousRoute: window.location.pathname } })}
              >
                Terms of Service
              </span>
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
        <div id="recaptcha-container" style={{ display: "none" }}></div>
      </div>
    </div>
  );
};

export default SignUp;
