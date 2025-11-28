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
import { Button } from '@mui/material';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY;

  // Check if user is already in auth flow (to skip animation)
  const shouldAnimate = !sessionStorage.getItem('inAuthFlow');

  // Set auth flow flag when component mounts
  useEffect(() => {
    sessionStorage.setItem('inAuthFlow', 'true');

    // Clear flag when navigating away from auth pages
    return () => {
      const currentPath = window.location.pathname;
      if (currentPath !== '/signin' && currentPath !== '/signup') {
        sessionStorage.removeItem('inAuthFlow');
      }
    };
  }, []);

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
  const isStrongPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  const sanitizeInput = (input) => input.replace(/[\0\x08\x09\x1a\n\r"'\\<>%]/g, "");


  const handleSignUp = async () => {
    setError("");
    setSuccess("");
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

      const sanitizedName = sanitizeInput(name.trim());
      const sanitizedEmail = sanitizeInput(email.trim());
      const sanitizedPassword = sanitizeInput(password);

      if (!sanitizedName) return setError('Please enter your name.');
      if (!isValidEmail(sanitizedEmail)) return setError('Please enter a valid email address.');
      if (sanitizedPassword.length < 8)
        return setError(
          'Password must be at least 8 characters long.'
        );
      if (!isStrongPassword(sanitizedPassword))
        return setError(
          'Password must include upper/lowercase letters, numbers, and special characters.'
        );
      if (sanitizedPassword !== confirmPassword)
        return setError('Passwords do not match.');
      if (!agreedToTerms)
        return setError('Please agree to the Terms & Conditions and Privacy Policy.');

      try {
        const emailKey = sanitizedEmail.replace(/\./g, '_');
        const userSnapshot = await get(ref(database, `userEmails/${emailKey}`));
        if (userSnapshot.exists())
          return setError('An account with this email already exists. Please sign in instead.');

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
          setSuccess('A verification email has been sent. Please check your inbox.');

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

        await set(ref(database, `userTiers/free/${data.user.id}`), {
          tier: "free",
          status: "active",
          billingCycle: "monthly",
          startDate: "",
          renewalDate: ""
        });

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
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="Signup-auth-page">
      <motion.div
        className="Signup-auth-container"
        initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldAnimate ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
      >
        {/* Left Side - Gradient Section */}
        <div className="Signup-auth-left">
          <div className="Signup-logo-section">
            <img src="/static/icons/logos/white-wingit.png" alt="WiNG.it Logo" className="Signup-logo-image" />
            <h1 className="Signup-logo-text">WiNG.it</h1>
          </div>

          <div className="Signup-auth-left-content">
            <div className="Signup-message-section">
              <p className="Signup-message-intro">Find yourself beginning</p>
              <h2 className="Signup-message-main">Your new professional tool haven</h2>
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="Signup-auth-right">
          <Button
            onClick={() => navigate('/')}
            className="Signup-back-button-right"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            <span>Back to Home</span>
          </Button>

          <div className="Signup-auth-form-container">
            <div className="Signup-auth-header">
              <h1 className="Signup-auth-title">Create Your Account</h1>
              <p className="Signup-auth-subtitle">Let's first set your account up!</p>
            </div>

            {error && <div className="Signup-message-box Signup-error-box">{error}</div>}
            {success && <div className="Signup-message-box Signup-success-box">{success}</div>}

            <div className="Signup-auth-form">
              {/* Name Input */}
              <motion.div variants={itemVariants} className="Signup-form-group">
                <label className="Signup-form-label">Full Name</label>
                <div className="Signup-input-wrapper">
                  <AccountCircle className="Signup-input-icon" />
                  <input
                    type="text"
                    className="Signup-form-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                  />
                </div>
              </motion.div>

              {/* Email Input */}
              <motion.div variants={itemVariants} className="Signup-form-group">
                <label className="Signup-form-label">Email Address</label>
                <div className="Signup-input-wrapper">
                  <EmailIcon className="Signup-input-icon" />
                  <input
                    type="email"
                    className="Signup-form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                  />
                </div>
              </motion.div>

              {/* Password Inputs - Side by Side */}
              <div className="Signup-password-row">
                <motion.div variants={itemVariants} className="Signup-form-group">
                  <label className="Signup-form-label">Password</label>
                  <div className="Signup-input-wrapper">
                    <LockIcon className="Signup-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="Signup-form-input"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                    />
                    <button
                      type="button"
                      className="Signup-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="Signup-form-group">
                  <label className="Signup-form-label">Confirm Password</label>
                  <div className="Signup-input-wrapper">
                    <LockIcon className="Signup-input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="Signup-form-input"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                    />
                    <button
                      type="button"
                      className="Signup-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Terms Checkbox */}
              <div className="Signup-terms-checkbox">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <label htmlFor="terms">
                  I agree to{' '}
                  <button
                    type="button"
                    className="Signup-terms-link"
                    onClick={() => navigate("/terms", { state: { previousRoute: window.location.pathname } })}
                  >
                    Terms & Conditions
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    className="Signup-terms-link"
                    onClick={() => navigate("/privacy", { state: { previousRoute: window.location.pathname } })}
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              <button className="Signup-primary-btn" onClick={handleSignUp} disabled={isLoading}>
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            </div>

            <div className="Signup-auth-footer">
              <p className="Signup-footer-text">
                Already have an account?{' '}
                <button
                  type="button"
                  className="Signup-link-btn"
                  onClick={() => navigate("/signin")}
                >
                  Sign in
                </button>
              </p>
            </div>

            <Typography
              component="small"
              className="Signup-recaptcha-text"
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
      <div id="recaptcha-container" style={{ display: "none" }}></div>
    </div>
  );
};

export default SignUp;
