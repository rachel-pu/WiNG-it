"use client";
import { useState } from 'react';
import { supabase } from '../../../../../supabase.js'
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import './Signup.css';
import { ref, set } from "firebase/database";
import {database} from '../../../../lib/firebase.jsx'


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
      // Create a new user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `/signin`,
        },
      });

      if (error) throw error;

      if (data?.user) {
        setError('A verification email has been sent. Please check your inbox.');
        await set(ref(database, `users/${data.user.id}`), {
          firstName: name,
          lastName: "",
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
      console.log('User signed up:', data.user);
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
          redirectTo: `/signin`,
        },
      });

      if (error) throw error;
      if (data?.user) {
        await set(ref(database, `users/${data.user.id}`), {
          firstName: name,
          lastName: "",
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
          <button
            onClick={() => navigate('/')}
            sx={{
                color: '#64748b',
                '&:hover': {
                backgroundColor: 'rgba(100, 116, 139, 0.1)',
                color: '#1e293b'
                },
                transition: 'all 0.3s ease',
                textTransform: 'none',
                fontFamily: 'DM Sans, sans-serif',
                gap: '8px',
                size: '20px'
            }}
            >
            <ArrowLeft size={20} />
        </button>
            <h1 className="auth-title">Sign Up</h1>
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

            <motion.div className="input-group" variants={itemVariants}>
                    <label className="input-label">Full Name</label>
                    <div className="input-wrapper">
                        <User className="input-icon" />
                        <input 
                        type="name" 
                        className="modern-input" 
                        placeholder="John Doe" 
                        value={name}
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
                        placeholder="you@example.com" 
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
                        placeholder="Enter your password"
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

            <button className="primary-btn" onClick={handleSignUp}>
                Continue
            </button>
            <p
              className="auth-description cursor-pointer"
              onClick={() => navigate("/signin")}
            >
              Have an account? Sign in instead.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
