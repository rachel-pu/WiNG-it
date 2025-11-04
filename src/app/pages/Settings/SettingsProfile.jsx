import { useState, useEffect} from 'react';
import { ref, get, update } from "firebase/database";
import {database, uploadResume} from '../../../lib/firebase.jsx'
import { ChevronRight, Check, X } from 'lucide-react';
import { uploadProfileImage } from '../../../../supabase.js';

export default function SettingsProfile() {
    const [editingSection, setEditingSection] = useState(null);
    const [error, setError] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const [formData, setFormData] = useState({
        personalInformation: {
            fullName: '',
            email: '',
            password: '',
        },
        academicInformation: {},
        professionalInformation: {},
        userId: '',}
    );

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
                    setFormData(snapshot.val());
                } else {
                    setError('User not found in database.');
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to fetch user data.');
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
    .filter((sectionKey) => sectionKey !== 'userId' && sectionKey !== 'resume' && sectionKey !== 'passwordLength'  && sectionKey !== 'onboardingCompleted' && sectionKey !== 'notificationPreferences')
    .map((sectionKey) => {
        const sectionData = formData[sectionKey] || {};

        const fields = Object.keys(sectionData)
            .map((fieldKey) => ({
                id: fieldKey,
                label: formatLabel(fieldKey),
                editable:
                    sectionKey === 'personalInformation'
                        ? fieldKey === 'fullName' 
                        : true,
                type: fieldKey.toLowerCase().includes('password')
                    ? 'password'
                    : 'text',
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
                fullName: tempName || ''
            });
            setFormData(prev => ({
                ...prev,
                personalInformation: {
                    ...prev.personalInformation,
                    fullName: tempName
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
            <div className="form-field" key={field.id}>
                <div className="field-row">
                    <label className="form-label">
                        {field.label}
                    </label>
                    {isEditing ? (
                        isTextarea ? (
                            <textarea
                                value={fieldValue}
                                onChange={(e) => handleChange(sectionId, field.id, e.target.value)}
                                className="form-textarea"
                            />
                        ) : (
                            <input
                                type="text"
                                value={fieldValue}
                                onChange={(e) => handleChange(sectionId, field.id, e.target.value)}
                                className="form-input"
                            />
                        )
                    ) : (
                        <div className={`form-display ${isTextarea ? 'textarea-display' : ''} ${!field.editable ? 'disabled' : ''}`}>
                            {typeof fieldValue === 'object'
                            ? JSON.stringify(fieldValue)
                            : fieldValue || 'Not set'}

                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="settings-content">
                                <div className="settings-card" key="personal">
                                    <h2 style={{marginBottom:'20px'}}>Personal Information</h2>
                                    <div className="personalInformation-section">
                                        <div className="profile-photo-section">
                                                <div className="profile-photo-container">
                                                    <img
                                                    src={formData.personalInformation?.profilePhoto || "../../../../public/static/images/blank_profile.png"}
                                                    alt="Profile"
                                                    className="profile-photo"
                                                    />
                                                </div>
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
                                                    } catch (err) {
                                                        console.error("Error uploading profile photo:", err);
                                                    }
                                                    }}
                                                />
                                            <button
                                                onClick={() => document.getElementById('profile-upload').click()}
                                                className="upload-button"
                                            >
                                                Change Photo
                                            </button>
                                        </div>

                                        <div className='personal-info-details'>
                                            <div className="info-row">
                                                <div className="info-row-content">
                                                    <div className="info-field">
                                                        <label className="info-label">Full Name</label>
                                                        {isEditingName ? (
                                                            <input
                                                                type="text"
                                                                value={tempName}
                                                                onChange={(e) => setTempName(e.target.value)}
                                                                className="info-input"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <div className="info-value">
                                                                {formData.personalInformation?.fullName || 'Not set'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="info-actions">
                                                        {isEditingName ? (
                                                            <>
                                                                <button
                                                                    onClick={handleSaveName}
                                                                    className="action-button save-button"
                                                                    title="Save"
                                                                >
                                                                    <Check size={20} />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="action-button cancel-button"
                                                                    title="Cancel"
                                                                >
                                                                    <X size={20} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={handleEditName}
                                                                className="action-button edit-button"
                                                                title="Edit name"
                                                            >
                                                                <ChevronRight size={20} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="info-row">
                                                <div className="info-row-content">
                                                    <div className="info-field">
                                    
                                                        <label className="info-label">Email</label>
                                                        <div className="info-value">
                                                            {formData.personalInformation?.email || 'Not set'}
                                                        </div>
                                                    </div>
                                                    <div className="info-spacer"></div>
                                                </div>
                                            </div>

                                            <div className="info-row info-row-last">
                                                <div className="info-row-content">
                                                    <div className="info-field">
                                                        <label className="info-label">Password</label>
                                                        <div className="info-value info-value-password">
                                                            {formData.passwordLength ? '•'.repeat(formData.passwordLength) : 'Not set'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="info-spacer"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            
                            {sections
                                .filter(section => section.id !== 'personalInformation')
                                .map(section => (
                                    <div className="settings-card" key={section.id}>
                                        <div className="settings-card-header">
                                        <h2>{section.title}</h2>
                                        <div className="button-group">
                                            {editingSection === section.id ? (
                                            <>
                                                <button
                                                onClick={() => handleSaveSection(section.id)}
                                                className="button-save"
                                                >
                                                Save Changes
                                                </button>
                                                <button
                                                onClick={handleCancelSection}
                                                className="button-cancel"
                                                >
                                                Cancel
                                                </button>
                                            </>
                                            ) : (
                                            <>
                                                <button
                                                onClick={() => handleEditSection(section.id)}
                                                className="button-edit"
                                                >
                                                Edit
                                                </button>
                                            </>
                                            )}
                                        </div>
                                        </div>

                                        {section.fields.map(field => renderField(field, section.id, editingSection === section.id))}
                                    </div>
                                ))}
                                <div className="resume-upload-section">
                                <h3>Resume</h3>
                                
                                {formData.resume ? (
                                    <div className="resume-display">
                                    <a href={formData.resume} target="_blank" rel="noopener noreferrer">
                                        {formData.personalInformation.fullName}'s Resume
                                    </a>
                                    </div>
                                ) : (
                                    <p>No resume uploaded</p>
                                )}

                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    id="resume-upload"
                                    style={{ display: "none" }}
                                    onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file || !formData.userId) return;

                                    try {
                                        const resumeUrl = await uploadResume(formData.userId, file);
                                        await update(ref(database, `users/${formData.userId}`), { resume: resumeUrl });
                                        setFormData((prev) => ({ ...prev, resume: resumeUrl }));
                                    } catch (err) {
                                        console.error("Error uploading resume:", err);
                                        setError("Failed to upload resume.");
                                    }
                                    }}
                                />
                                <button
                                    onClick={() => document.getElementById("resume-upload").click()}
                                    className="upload-button"
                                >
                                    {formData.resume ? "Replace Resume" : "Upload Resume"}
                                </button>
                                </div>
                            </div>
        </div>
    );
}