"use client";
import { useState } from 'react';
import './Signin.css';
import { supabase } from '../../../../../supabase.js'
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft} from 'lucide-react';
import { useNavigate } from "react-router-dom";

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

    const handleSignIn = async () => {
        setError('');

        if (!isValidEmail(email)) return setError('Please enter a valid email address.');
        if (!password.trim()) return setError('Please enter your password.');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            console.log('User signed in:', data.user);
            setError('Successfully signed in!');
            navigate('/dashboard')
        } catch (err) {
            console.error("Sign-in error:", err);
            if (err.message.includes("Invalid login credentials")) {
                setError("Invalid email or password. Please try again.");
            } else {
                setError(err.message || "An unexpected error occurred during sign-in.");
            }
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
                <h1 className="auth-title">Welcome Back</h1>
               

                {error && <div className="message-box error-box">{error}</div>}
                
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


                <button className="primary-btn" onClick={handleSignIn}>
                    Continue
                </button>
                <p
                className="auth-description cursor-pointer"
                style={{ marginTop: 10, color: "#2381edff", textDecoration: "underline" }}
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
