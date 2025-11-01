import { useState, useEffect } from 'react';
import { ref, get, update } from "firebase/database";
import { database } from '../../../lib/firebase.jsx';
import Box from '@mui/material/Box';
import DefaultAppLayout from "../../DefaultAppLayout.jsx";
import { Bell, Mail, TrendingUp, Shield } from 'lucide-react';
import "./SettingsNotifications.css";

export default function SettingsNotifications() {
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        userId: '',
        notificationPreferences: {
            email: {
                enabled: true,
                frequency: 'instant',
                types: {}
            },
        }
    });

    useEffect(() => {
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const userId = getCookie('user_id');
        if (userId) {
            setFormData((prev) => ({ ...prev, userId }));
        } else {
            console.log('No user_id cookie found');
        }
    }, []);

    useEffect(() => {
        const fetchNotificationPreferences = async () => {
            if (!formData.userId) return;
            try {
                const snapshot = await get(ref(database, `users/${formData.userId}/notificationPreferences`));
                if (snapshot.exists()) {
                    setFormData(prev => ({
                        ...prev,
                        notificationPreferences: snapshot.val()
                    }));
                }
            } catch (err) {
                console.error('Error fetching notification preferences:', err);
                setError('Failed to fetch notification preferences.');
            }
        };
        fetchNotificationPreferences();
    }, [formData.userId]);

    const handleToggleEmailType = async (type) => {
        const newValue = !formData.notificationPreferences.email.types[type];
        try {
            await update(ref(database, `users/${formData.userId}/notificationPreferences/email/types`), {
                [type]: newValue
            });
            setFormData(prev => ({
                ...prev,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    email: {
                        ...prev.notificationPreferences.email,
                        types: {
                            ...prev.notificationPreferences.email.types,
                            [type]: newValue
                        }
                    }
                }
            }));
        } catch (err) {
            console.error('Error updating email type:', err);
        }
    };

    const handleChangeEmailFrequency = async (frequency) => {
        try {
            await update(ref(database, `users/${formData.userId}/notificationPreferences/email`), {
                frequency: frequency
            });
            setFormData(prev => ({
                ...prev,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    email: {
                        ...prev.notificationPreferences.email,
                        frequency: frequency
                    }
                }
            }));
        } catch (err) {
            console.error('Error updating email frequency:', err);
        }
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const emailTypes = [
        { key: 'security', label: 'Security Alerts', description: 'Login attempts, password changes, and security updates', icon: Shield },
        { key: 'billing', label: 'Billing & Payments', description: 'Invoices, payment confirmations, and subscription updates', icon: TrendingUp },
        { key: 'updates', label: 'Product Updates', description: 'New features, improvements, and platform updates', icon: Bell },
    ];

    return (
        <Box>
            <DefaultAppLayout>
                <div className="settings-page">
                    <div className="settings-container">
                        <div className="glass-container">
                            <div className='settings-navbar'>
                                <a href="/settings/profile" className="settings-navlink">Profile</a>
                                <a href="/settings/billings" className="settings-navlink">Billings</a>
                                <a href="/settings/plan" className="settings-navlink">Plan</a>
                                <a href="/settings/notifications" className="settings-navlink">Notifications</a>
                            </div>
                            <h1 className="settings-title-profile">Notification Settings</h1>

                            <div className="settings-content">
                                <div className="notification-card">
                                    <div className="notification-card-header">
                                        <div className="header-with-icon">
                                            <Mail size={24} className="section-icon" />
                                            <div>
                                                <h2>Email Notifications</h2>
                                                <p className="section-description">Manage how you receive email notifications</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="notification-section">
                                        <div className="info-row">
                                            <div className="info-row-content">
                                                <div className="info-field">
                                                    <label className="info-label">Email Frequency</label>
                                                    <div className="info-description">How often you want to receive email notifications</div>
                                                </div>
                                                <select
                                                    value={formData.notificationPreferences.email.frequency}
                                                    onChange={(e) => handleChangeEmailFrequency(e.target.value)}
                                                    className="frequency-select"
                                                >
                                                    <option value="instant">Instant</option>
                                                    <option value="weekly">Weekly Digest</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="notification-types">
                                        <h3>Email Types</h3>
                                        {emailTypes.map((type) => {
                                            const Icon = type.icon;
                                            return (
                                                <div className="notification-type-row" key={type.key}>
                                                    <div className="type-content">
                                                        <Icon size={20} className="type-icon" />
                                                        <div className="type-info">
                                                            <div className="type-label">{type.label}</div>
                                                            <div className="type-description">{type.description}</div>
                                                        </div>
                                                    </div>
                                                    <label className="toggle-switch-small">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.notificationPreferences.email.types[type.key]}
                                                            onChange={() => handleToggleEmailType(type.key)}
                                                        />
                                                        <span className="toggle-slider-small"></span>
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DefaultAppLayout>
        </Box>
    );
}