import { useState, useEffect } from 'react';
import { ref, get, update } from "firebase/database";
import { database } from '../../../lib/firebase.jsx';
import Box from '@mui/material/Box';
import DefaultAppLayout from "../../DefaultAppLayout.jsx";
import { Bell, Mail, MessageSquare, Calendar, TrendingUp, Users, Shield } from 'lucide-react';
import "./SettingsNotifications.css";

export default function SettingsNotifications() {
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        userId: '',
        notificationPreferences: {
            email: {
                enabled: true,
                frequency: 'instant', // 'instant', 'daily', 'weekly', 'never'
                types: {
                    security: true,
                    updates: true,
                    marketing: false,
                    billing: true,
                    social: true,
                    projectActivity: true
                }
            },
            push: {
                enabled: true,
                types: {
                    messages: true,
                    mentions: true,
                    updates: false,
                    reminders: true,
                    teamActivity: true
                }
            },
            inApp: {
                enabled: true,
                types: {
                    all: true
                }
            },
            doNotDisturb: {
                enabled: false,
                startTime: '22:00',
                endTime: '08:00'
            }
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

    const handleToggleEmailEnabled = async () => {
        const newValue = !formData.notificationPreferences.email.enabled;
        try {
            await update(ref(database, `users/${formData.userId}/notificationPreferences/email`), {
                enabled: newValue
            });
            setFormData(prev => ({
                ...prev,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    email: {
                        ...prev.notificationPreferences.email,
                        enabled: newValue
                    }
                }
            }));
        } catch (err) {
            console.error('Error updating email notifications:', err);
            alert('Failed to update email notifications.');
        }
    };

    const handleTogglePushEnabled = async () => {
        const newValue = !formData.notificationPreferences.push.enabled;
        try {
            await update(ref(database, `users/${formData.userId}/notificationPreferences/push`), {
                enabled: newValue
            });
            setFormData(prev => ({
                ...prev,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    push: {
                        ...prev.notificationPreferences.push,
                        enabled: newValue
                    }
                }
            }));
        } catch (err) {
            console.error('Error updating push notifications:', err);
            alert('Failed to update push notifications.');
        }
    };

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
            alert('Failed to update notification preference.');
        }
    };

    const handleTogglePushType = async (type) => {
        const newValue = !formData.notificationPreferences.push.types[type];
        try {
            await update(ref(database, `users/${formData.userId}/notificationPreferences/push/types`), {
                [type]: newValue
            });
            setFormData(prev => ({
                ...prev,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    push: {
                        ...prev.notificationPreferences.push,
                        types: {
                            ...prev.notificationPreferences.push.types,
                            [type]: newValue
                        }
                    }
                }
            }));
        } catch (err) {
            console.error('Error updating push type:', err);
            alert('Failed to update notification preference.');
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
            alert('Failed to update email frequency.');
        }
    };

    const handleToggleDoNotDisturb = async () => {
        const newValue = !formData.notificationPreferences.doNotDisturb.enabled;
        try {
            await update(ref(database, `users/${formData.userId}/notificationPreferences/doNotDisturb`), {
                enabled: newValue
            });
            setFormData(prev => ({
                ...prev,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    doNotDisturb: {
                        ...prev.notificationPreferences.doNotDisturb,
                        enabled: newValue
                    }
                }
            }));
        } catch (err) {
            console.error('Error updating do not disturb:', err);
            alert('Failed to update do not disturb setting.');
        }
    };

    const handleChangeDoNotDisturbTime = async (field, value) => {
        try {
            await update(ref(database, `users/${formData.userId}/notificationPreferences/doNotDisturb`), {
                [field]: value
            });
            setFormData(prev => ({
                ...prev,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    doNotDisturb: {
                        ...prev.notificationPreferences.doNotDisturb,
                        [field]: value
                    }
                }
            }));
        } catch (err) {
            console.error('Error updating do not disturb time:', err);
            alert('Failed to update do not disturb time.');
        }
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const emailTypes = [
        { key: 'security', label: 'Security Alerts', description: 'Login attempts, password changes, and security updates', icon: Shield },
        { key: 'billing', label: 'Billing & Payments', description: 'Invoices, payment confirmations, and subscription updates', icon: TrendingUp },
        { key: 'projectActivity', label: 'Project Activity', description: 'Updates on projects you\'re following or contributing to', icon: Calendar },
        { key: 'social', label: 'Social', description: 'Mentions, comments, and messages from other users', icon: Users },
        { key: 'updates', label: 'Product Updates', description: 'New features, improvements, and platform updates', icon: Bell },
        { key: 'marketing', label: 'Marketing & Tips', description: 'Product tips, best practices, and promotional content', icon: Mail }
    ];

    const pushTypes = [
        { key: 'messages', label: 'Direct Messages', description: 'New messages from other users' },
        { key: 'mentions', label: 'Mentions', description: 'When someone mentions you in a comment or post' },
        { key: 'reminders', label: 'Reminders', description: 'Task deadlines and scheduled reminders' },
        { key: 'teamActivity', label: 'Team Activity', description: 'Updates from your team members' },
        { key: 'updates', label: 'General Updates', description: 'Other platform notifications' }
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
                                {/* Email Notifications */}
                                <div className="notification-card">
                                    <div className="notification-card-header">
                                        <div className="header-with-icon">
                                            <Mail size={24} className="section-icon" />
                                            <div>
                                                <h2>Email Notifications</h2>
                                                <p className="section-description">Manage how you receive email notifications</p>
                                            </div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={formData.notificationPreferences.email.enabled}
                                                onChange={handleToggleEmailEnabled}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    {formData.notificationPreferences.email.enabled && (
                                        <>
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
                                                            <option value="daily">Daily Digest</option>
                                                            <option value="weekly">Weekly Digest</option>
                                                            <option value="never">Never</option>
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
                                        </>
                                    )}
                                </div>

                                {/* Push Notifications */}
                                <div className="notification-card">
                                    <div className="notification-card-header">
                                        <div className="header-with-icon">
                                            <Bell size={24} className="section-icon" />
                                            <div>
                                                <h2>Push Notifications</h2>
                                                <p className="section-description">Manage browser and mobile push notifications</p>
                                            </div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={formData.notificationPreferences.push.enabled}
                                                onChange={handleTogglePushEnabled}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    {formData.notificationPreferences.push.enabled && (
                                        <div className="notification-types">
                                            <h3>Push Notification Types</h3>
                                            {pushTypes.map((type) => (
                                                <div className="notification-type-row" key={type.key}>
                                                    <div className="type-content">
                                                        <MessageSquare size={20} className="type-icon" />
                                                        <div className="type-info">
                                                            <div className="type-label">{type.label}</div>
                                                            <div className="type-description">{type.description}</div>
                                                        </div>
                                                    </div>
                                                    <label className="toggle-switch-small">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.notificationPreferences.push.types[type.key]}
                                                            onChange={() => handleTogglePushType(type.key)}
                                                        />
                                                        <span className="toggle-slider-small"></span>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Do Not Disturb */}
                                <div className="notification-card">
                                    <div className="notification-card-header">
                                        <div className="header-with-icon">
                                            <Bell size={24} className="section-icon" />
                                            <div>
                                                <h2>Do Not Disturb</h2>
                                                <p className="section-description">Silence notifications during specific hours</p>
                                            </div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={formData.notificationPreferences.doNotDisturb.enabled}
                                                onChange={handleToggleDoNotDisturb}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    {formData.notificationPreferences.doNotDisturb.enabled && (
                                        <div className="notification-section">
                                            <div className="info-row">
                                                <div className="info-row-content">
                                                    <div className="info-field">
                                                        <label className="info-label">Quiet Hours</label>
                                                        <div className="info-description">Notifications will be silenced during these hours</div>
                                                    </div>
                                                    <div className="time-inputs">
                                                        <input
                                                            type="time"
                                                            value={formData.notificationPreferences.doNotDisturb.startTime}
                                                            onChange={(e) => handleChangeDoNotDisturbTime('startTime', e.target.value)}
                                                            className="time-input"
                                                        />
                                                        <span className="time-separator">to</span>
                                                        <input
                                                            type="time"
                                                            value={formData.notificationPreferences.doNotDisturb.endTime}
                                                            onChange={(e) => handleChangeDoNotDisturbTime('endTime', e.target.value)}
                                                            className="time-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DefaultAppLayout>
        </Box>
    );
}