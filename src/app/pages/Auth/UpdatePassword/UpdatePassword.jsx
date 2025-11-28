"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import bcrypt from 'bcryptjs';
import '../Signin/Signin.css';
import './UpdatePassword.css';
import { supabase } from '../../../../../supabase.js';
import { ref, update } from "firebase/database";
import {database} from '../../../../lib/firebase.jsx'

const UpdatePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isValidToken, setIsValidToken] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };


    // Check for valid recovery token on component mount
    useEffect(() => {
        const checkRecoveryToken = async () => {
            try {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const type = hashParams.get('type');

                if (type !== 'recovery' || !accessToken) {
                    setError('Invalid or expired password reset link.');
                    setIsLoading(false);
                    handleBackToSignIn();
                    return;
                }

                const { data: { user }, error } = await supabase.auth.getUser(accessToken);
                
                if (error || !user) {
                    setError('Invalid or expired password reset link.');
                    setIsLoading(false);
                    handleBackToSignIn();
                    return;
                }

                // Token is valid
                setIsValidToken(true);
                setIsLoading(false);
            } catch (err) {
                console.error('Error checking recovery token:', err);
                setError('An error occurred. Please try again.');
                setIsLoading(false);
                handleBackToSignIn();
            }
        };

        checkRecoveryToken();
    }, [navigate]);

    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter.';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter.';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number.';
        }
        return null;
    };

    const handleUpdatePassword = async () => {
        setError('');

        // Validate inputs
        if (!newPassword.trim() || !confirmPassword.trim())
            return setError('Please fill in all fields.');
        const passwordError = validatePassword(newPassword);
        if (passwordError)
            return setError(passwordError);
        if (newPassword !== confirmPassword)
            return setError('Passwords do not match.');

        try {
            // Update the password in Supabase
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            console.log('Supabase password updated successfully:', data);
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            if (data?.user) {
                await update(ref(database, `users/${data.user.id}`), {
                    password: hashedPassword,
                });
            }

            console.log('Firebase password updated successfully');
            setSuccess(true);
            handleBackToSignIn();
        } catch (err) {
            console.error('Error updating password:', err);
            setError(err.message || 'An error occurred while updating your password.');
        }
    };

    const handleBackToSignIn = async() => {
        await supabase.auth.signOut();
        setTimeout(() => {
            navigate('/signin');
        }, 3000);
    }


    if (isLoading) {
        return (
            <div className="UpdatePassword-auth-page">
                <div className="UpdatePassword-auth-card">
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <p style={{ color: '#64748b' }}>Verifying reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className="UpdatePassword-auth-page">
                <div className="UpdatePassword-auth-card">
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
                        <Button>Sign In</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="UpdatePassword-auth-page">
                <div className="UpdatePassword-auth-card">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ textAlign: 'center', padding: '40px 0' }}
                    >
                        <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 24px' }} />
                        <h2 style={{ color: '#1e293b', marginBottom: '12px' }}>Password Updated!</h2>
                        <p style={{ color: '#64748b' }}>Redirecting to sign in...</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="UpdatePassword-auth-page">
            <div className="UpdatePassword-auth-card">
                <h1 className="UpdatePassword-auth-title">Update Password</h1>
                <p className="UpdatePassword-description" style={{ marginBottom: '32px' }}>
                    Enter your new password below
                </p>

                {error && <div className="UpdatePassword-message-box UpdatePassword-error-box">{error}</div>}
                
                <motion.div className="UpdatePassword-update-input-group" variants={itemVariants}>
                    <label className="UpdatePassword-update-input-label">New Password</label>
                    <div className="UpdatePassword-update-input-wrapper">
                        <Lock className="UpdatePassword-update-input-icon" />
                        <input 
                            type={showNewPassword ? "text" : "password"}
                            className="UpdatePassword-modern-update-input UpdatePassword-password-input-field" 
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button 
                            type="button"
                            className="UpdatePassword-password-toggle"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword ? <EyeOff style={{marginLeft:'10px'}} size={18} /> : <Eye style={{marginLeft:'10px'}} size={18} />}
                        </button>
                    </div>
                </motion.div>

                <motion.div className="UpdatePassword-update-input-group" variants={itemVariants}>
                    <label className="UpdatePassword-update-input-label">Confirm Password</label>
                    <div className="UpdatePassword-update-input-wrapper">
                        <Lock className="UpdatePassword-update-input-icon" />
                        <input 
                            type={showConfirmPassword ? "text" : "password"}
                            className="UpdatePassword-modern-update-input UpdatePassword-password-input-field" 
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button 
                            type="button"
                            className="UpdatePassword-password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff style={{marginLeft:'10px'}} size={18} /> : <Eye style={{marginLeft:'10px'}} size={18} />}
                        </button>
                    </div>
                </motion.div>

                <div style={{ 
                    background: '#ffffffff', 
                    padding: '16px', 
                    borderRadius: '8px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    color: '#64748b',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                }}>
                    <p style={{ fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
                        Password requirements:
                    </p>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li>At least 8 characters long</li>
                        <li>Contains uppercase and lowercase letters</li>
                        <li>Contains at least one number</li>
                    </ul>
                </div>

                <button className="UpdatePassword-primary-btn" onClick={handleUpdatePassword}>
                    Update Password
                </button>

                <p className="UpdatePassword-auth-description cursor-pointer" onClick={handleBackToSignIn} style={{ marginTop: 15 }}>
                    Back to Sign In
                </p>
            </div>
        </div>
    );
};

export default UpdatePassword;