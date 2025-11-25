import { useState, useEffect} from 'react';
import { ref, get, update } from "firebase/database";
import {database} from '../../../lib/firebase.jsx'
import { Check, X, Upload } from 'lucide-react';
import { uploadProfileImage } from '../../../../supabase.js';
import Swal from 'sweetalert2';

export default function SettingsProfile() {
    const [editingSection, setEditingSection] = useState(null);
    const [error, setError] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        personalInformation: {
            fullName: '',
            email: '',
            password: '',
            profilePhoto: '',
        },
        academicInformation: {},
        professionalInformation: {},
        userId: '',
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
        const fetchUser = async () => {
            if (!formData.userId) return;
            try {
                const snapshot = await get(ref(database, `users/${formData.userId}`));
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setFormData(userData);
                } else {
                    setError('User not found in database.');
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to fetch user data.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [formData.userId]);

    const formatLabel = (camelCase) => {
        return camelCase
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    };

    const sections = Object.keys(formData)
    .filter((sectionKey) =>
        sectionKey !== 'userId' &&
        sectionKey !== 'resume' &&
        sectionKey !== 'passwordLength' &&
        sectionKey !== 'onboardingCompleted' &&
        sectionKey !== 'notificationPreferences' &&
        sectionKey !== 'personalInformation' &&
        sectionKey !== 'subscription' &&
        sectionKey !== 'billingInformation' &&
        sectionKey !== 'interviewPreferences' &&
        !sectionKey.toLowerCase().includes('stripe')
    )
    .map((sectionKey) => {
        const sectionData = formData[sectionKey] || {};

        const fields = Object.keys(sectionData)
            .map((fieldKey) => ({
                id: fieldKey,
                label: formatLabel(fieldKey),
                editable: true,
                type: fieldKey.toLowerCase().includes('password') ? 'password' : 'text',
            }));

        return {
            id: sectionKey,
            title: formatLabel(sectionKey),
            deletable: false,
            fields,
        };
    });

    const handleEditSection = (section) => {
        setEditingSection(section);
    };

    const handleEditName = () => {
        setTempName(formData.personalInformation?.fullName || '');
        setIsEditingName(true);
    };

    const handleCancelEdit = () => {
        setIsEditingName(false);
        setTempName('');
    };

    const handleSaveName = async () => {
        if (!formData.userId) {
            return;
        }

        try {
            await update(ref(database, `users/${formData.userId}/personalInformation`), {
                fullName: tempName,
            });
            setFormData(prev => ({
                ...prev,
                personalInformation: {
                    ...prev.personalInformation,
                    fullName: tempName,
                }
            }));
            setIsEditingName(false);
        } catch (err) {
            console.error('Error updating name:', err);
        }
    }

    const handleSaveSection = async (sectionId) => {
        setEditingSection(null);
        if (!formData.userId) {
            return;
        }

        try {
            const sectionData = formData[sectionId] || {};
            const updates = {
                [sectionId]: sectionData,
                onboardingCompleted: true
            };

            await update(ref(database, `users/${formData.userId}`), updates);
        } catch (err) {
            console.error('Error updating section:', err);
        }
    };

    const handleCancelSection = () => {
        setEditingSection(null);
    };

    const handleChange = (sectionId, fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                [fieldId]: value
            }
        }));
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const renderField = (field, sectionId, isEditingSection) => {
        const isTextarea = field.type === 'textarea';
        const isEditing = isEditingSection && field.editable;
        const fieldValue = formData[sectionId]?.[field.id] || '';

        return (
            <div className="SettingsProfile-field-row" key={field.id}>
                <label className="SettingsProfile-field-label">
                    {field.label}
                </label>
                <div className="SettingsProfile-field-input-wrapper">
                    {isEditing ? (
                        isTextarea ? (
                            <textarea
                                value={fieldValue}
                                onChange={(e) => handleChange(sectionId, field.id, e.target.value)}
                                className="SettingsProfile-textarea"
                            />
                        ) : (
                            <input
                                type="text"
                                value={fieldValue}
                                onChange={(e) => handleChange(sectionId, field.id, e.target.value)}
                                className="SettingsProfile-field-input"
                            />
                        )
                    ) : (
                        <div className={`SettingsProfile-field-display ${!field.editable ? 'disabled' : ''}`}>
                            {typeof fieldValue === 'object'
                            ? JSON.stringify(fieldValue)
                            : fieldValue || 'Not set'}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (<div className="SettingsProfile-spinner"></div>); 
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="SettingsProfile-content">
            {/* Name Field */}
            <div className="SettingsProfile-field-row">
                <label className="SettingsProfile-field-label">Name</label>
                <div className="SettingsProfile-name-inputs">
                    {isEditingName ? (
                        <>
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                placeholder="Full name"
                                className="SettingsProfile-field-input"
                                autoFocus
                            />
                            <div className="SettingsProfile-name-actions">
                                <button
                                    onClick={handleSaveName}
                                    className="SettingsProfile-icon-btn save"
                                    title="Save"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="SettingsProfile-icon-btn cancel"
                                    title="Cancel"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="SettingsProfile-field-input">
                                {formData.personalInformation?.fullName || 'Full name'}
                            </div>
                            <button
                                onClick={handleEditName}
                                className="SettingsProfile-edit-btn"
                                title="Edit name"
                            >
                                Edit
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Email Field */}
            <div className="SettingsProfile-field-row">
                <label className="SettingsProfile-field-label">Email address</label>
                <div className="SettingsProfile-field-input-wrapper">
                    <div className="SettingsProfile-field-input with-icon">
                        <span>{formData.personalInformation?.email || 'Not set'}</span>
                    </div>
                </div>
            </div>

            {/* Photo Upload */}
            <div className="SettingsProfile-field-row">
                <div className="SettingsProfile-field-label-group">
                    <label className="SettingsProfile-field-label">Your photo</label>
                    <p className="SettingsProfile-field-description">This will be displayed on your profile.</p>
                </div>
                <div className="SettingsProfile-photo-upload-section">
                    <div className="SettingsProfile-photo-preview">
                        <img
                            src={formData.personalInformation?.profilePhoto || "/static/images/blank_profile.png"}
                            alt="Profile"
                            className="SettingsProfile-avatar"
                        />
                    </div>
                    <div className="SettingsProfile-upload-area">
                        <input
                            type="file"
                            accept="image/*"
                            id="profile-upload"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !formData.userId) return;
                                try {
                                    const imageUrl = await uploadProfileImage(formData.userId, file);
                                    await update(ref(database, `users/${formData.userId}/personalInformation`), {
                                        profilePhoto: imageUrl,
                                    });
                                    setFormData(prev => ({
                                        ...prev,
                                        personalInformation: { ...prev.personalInformation, profilePhoto: imageUrl },
                                    }));
                                    window.location.reload();
                                } catch (err) {
                                    console.error("Error uploading profile photo:", err);
                                }
                            }}
                        />
                        <div
                        className={`SettingsProfile-upload-box ${isDragging ? "drag-over" : ""}`}
                        onClick={() => document.getElementById('profile-upload').click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true); // Highlight the box
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            setIsDragging(false); // Remove highlight
                        }}
                        onDrop={async (e) => {
                            e.preventDefault();
                            setIsDragging(false); // Remove highlight

                            const file = e.dataTransfer.files?.[0];
                            if (!file || !formData.userId) return;

                            try {
                            const imageUrl = await uploadProfileImage(formData.userId, file);
                            await update(ref(database, `users/${formData.userId}/personalInformation`), {
                                profilePhoto: imageUrl,
                            });
                            setFormData(prev => ({
                                ...prev,
                                personalInformation: { ...prev.personalInformation, profilePhoto: imageUrl },
                            }));
                            window.location.reload();
                            } catch (err) {
                            console.error("Error uploading profile photo:", err);
                            }
                        }}
                        >
                        <Upload size={20} className="upload-icon" />
                        <div>
                            <span className="upload-text-primary">Click to upload</span>
                            <span className="upload-text-secondary"> or drag and drop</span>
                        </div>
                        <p className="upload-text-hint">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Field */}
            <div className="SettingsProfile-field-row">
                <label className="SettingsProfile-field-label">Password</label>
                <div className="SettingsProfile-field-input-wrapper">
                    <div className="SettingsProfile-field-input">
                        {formData.passwordLength ? '•'.repeat(formData.passwordLength) : 'Not set'}
                    </div>
                </div>
            </div>

            {/* Additional Sections (Academic, Professional, etc.) */}
            {sections.map(section => (
                <div key={section.id} className="SettingsProfile-section">
                    <div className="SettingsProfile-section-header-inline">
                        <h3 className="SettingsProfile-section-title-inline">{section.title}</h3>
                        <div className="SettingsProfile-section-actions">
                            {editingSection === section.id ? (
                                <>
                                    <button
                                        onClick={() => handleSaveSection(section.id)}
                                        className="SettingsProfile-btn-small save"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancelSection}
                                        className="SettingsProfile-btn-small cancel"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleEditSection(section.id)}
                                    className="SettingsProfile-btn-small edit"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                    {section.fields.map(field => renderField(field, section.id, editingSection === section.id))}
                </div>
            ))}

            {/* Resume Upload */}
            <div className="SettingsProfile-field-row">
                <label className="SettingsProfile-field-label">Resume</label>
                <div className="SettingsProfile-field-input-wrapper">
                    {formData.resume ? (
                        <div className="SettingsProfile-resume-link">
                            <a href={formData.resume} target="_blank" rel="noopener noreferrer">
                                {formData.personalInformation.fullName}'s Resume
                            </a>
                        </div>
                    ) : (
                        <p className="SettingsProfile-field-placeholder">No resume uploaded</p>
                    )}
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        id="resume-upload"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !formData.userId) return;
                            const userId = formData.userId;

                            const toBase64 = file =>
                                new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(file);
                                    reader.onload = () => resolve(reader.result);
                                    reader.onerror = reject;
                                });

                            const base64File = await toBase64(file);
                            
                            try {
                                 const payload = {
                                    userId,
                                    file: base64File
                                };
                                const res = await fetch(
                                    "https://us-central1-wing-it-e6a3a.cloudfunctions.net/uploadResume",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify(payload)
                                    }
                                );
                                const { downloadURL } = await res.json();
                                await update(ref(database, `users/${userId}`), { resume: downloadURL });
                                setFormData((prev) => ({ ...prev, resume: downloadURL }));

                                Swal.fire({
                                    title: "Resume successfully uploaded!",
                                    icon: "success"
                                });
                            } catch (err) {
                                console.error("Error uploading resume:", err);
                                setError("Failed to upload resume.");
                            }
                        }}
                    />
                    <button
                        onClick={() => document.getElementById("resume-upload").click()}
                        className="SettingsProfile-btn-upload"
                    >
                        {formData.resume ? "Replace Resume" : "Upload Resume"}
                    </button>
                </div>
            </div>
        </div>
    );
}
