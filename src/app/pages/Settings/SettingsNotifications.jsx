import { useState, useEffect } from 'react';
import { ref, get, update } from "firebase/database";
import { database } from '../../../lib/firebase.jsx';
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
        <div className="SettingsNotifications-content">
            {/* Email Frequency */}
            <div className="SettingsNotifications-field-row">
                <div className="SettingsNotifications-field-label-group">
                    <label className="SettingsNotifications-field-label">Email Frequency</label>
                    <p className="SettingsNotifications-field-description">
                        How often you want to receive email notifications
                    </p>
                </div>
                <div className="SettingsNotifications-field-input-wrapper">
                    <select
                        value={formData.notificationPreferences.email.frequency}
                        onChange={(e) => handleChangeEmailFrequency(e.target.value)}
                        className="SettingsNotifications-select"
                    >
                        <option value="instant">Instant</option>
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly Digest</option>
                    </select>
                </div>
            </div>

            {/* Email Notification Types Section */}
            <div className="SettingsNotifications-section">
                <h3 className="SettingsNotifications-section-title">Email Notification Types</h3>

                {emailTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                        <div className="SettingsNotifications-field-row" key={type.key}>
                            <div className="SettingsNotifications-field-label-group">
                                <div className="SettingsNotifications-label-with-icon">
                                    <Icon size={20} className="SettingsNotifications-icon" />
                                    <label className="SettingsNotifications-field-label">{type.label}</label>
                                </div>
                                <p className="SettingsNotifications-field-description">
                                    {type.description}
                                </p>
                            </div>
                            <div className="SettingsNotifications-field-input-wrapper">
                                <label className="SettingsNotifications-toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.notificationPreferences.email.types[type.key]}
                                        onChange={() => handleToggleEmailType(type.key)}
                                    />
                                    <span className="SettingsNotifications-toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}