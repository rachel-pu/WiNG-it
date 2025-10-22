import { useState, useEffect} from 'react';
import { ref, get, update } from "firebase/database";
import {database} from '../../../lib/firebase.jsx'
import Box from '@mui/material/Box';
import DefaultAppLayout from "../../DefaultAppLayout.jsx";
import "./Settings.css"

export default function Settings() {
    const [editingSection, setEditingSection] = useState(null);
    const [error, setError] = useState('');
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
    .filter((sectionKey) => sectionKey !== 'userId' && sectionKey !== 'resume' && sectionKey !== 'passwordLength')
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

    const handleSaveName = async () => {
        if (!formData.userId) {
            alert("User ID not found!");
            return;
        }

        try {
            await update(ref(database, `users/${formData.userId}/personalInformation`), {
                fullName: formData.personalInformation.fullName || ''
            });
            alert('Name updated successfully!');
        } catch (err) {
            console.error('Error updating name:', err);
            alert('Failed to update name.');
        }
    }

    const handleSaveSection = async (sectionId) => {
        setEditingSection(null);
        if (!formData.userId) {
            alert("User ID not found!");
            return;
        }

        try {
            const sectionData = formData[sectionId] || {};
            const updates = {
                [sectionId]: sectionData 
            };

            await update(ref(database, `users/${formData.userId}`), updates);
            alert('Section updated successfully!');
        } catch (err) {
            console.error('Error updating section:', err);
            alert('Failed to update section.');
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
                <div className="field-header">
                    <label className="form-label">
                        {field.label}
                    </label>
                </div>
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
                        {fieldValue || 'Not set'}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Box>
            <DefaultAppLayout>
                <div className="settings-page">
                    <div className="settings-container">
                        <h1 className="settings-title">Settings</h1>
                        <p className="settings-subtitle">Manage your account information and preferences</p>
                        
                        <div className="settings-card" key="personal">
                            <h2>Personal Information</h2>

                            <div className="form-field">
                                <label className="form-label" style={{marginTop:"15px"}}>Full Name</label>
                                <div className="form-inline">
                                    <input
                                        type="text"
                                        value={formData.personalInformation?.fullName || ''}
                                        onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            personalInformation: {
                                                ...prev.personalInformation,
                                                fullName: e.target.value
                                            }
                                        }))
                                        }
                                        className="form-input"
                                    />
                                    <button
                                        onClick={() => handleSaveName()}
                                        className="button-save"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="form-label">Email</label>
                                <input
                                    type="text"
                                    value={formData.personalInformation?.email || ''}
                                    readOnly
                                    className="form-input"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    value={formData.passwordLength ? '•'.repeat(formData.passwordLength) : ''}
                                    readOnly
                                    className="form-input"
                                />
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
                    </div>
                </div>
            </DefaultAppLayout>
        </Box>
    );
}