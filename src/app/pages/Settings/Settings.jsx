import { useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import DefaultAppLayout from "../../DefaultAppLayout.jsx";
import "./Settings.css"
import { ref, get, update } from "firebase/database";
import {database} from '../../../lib/firebase.jsx'

export default function Settings() {
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState(null);
    const [error, setError] = useState('');
    const [showAddSection, setShowAddSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
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

    const formatLabel = (camelCase) => {
        return camelCase
            .replace(/([A-Z])/g, ' $1') 
            .replace(/^./, str => str.toUpperCase());
    };
    console.log("Form Data:", formData);
    const sections = Object.keys(formData)
    .filter((sectionKey) => sectionKey !== 'userId' && sectionKey !== 'resume')
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


    const handleDeleteSection = (sectionId) => {
        if (window.confirm('Are you sure you want to delete this section?')) {
            setSections(sections.filter(section => section.id !== sectionId));
        }
    };

    const handleAddSection = () => {
        let newSection;

        if (selectedTemplate && selectedTemplate !== 'custom') {
            const template = sectionTemplates[selectedTemplate];
            newSection = {
                id: `${selectedTemplate}_${Date.now()}`,
                title: template.title,
                deletable: true,
                fields: template.fields.map(field => ({
                    ...field,
                    id: `${field.id}_${Date.now()}`
                }))
            };
            // Initialize fields in formData
            template.fields.forEach(field => {
                const fieldId = `${field.id}_${Date.now()}`;
                setFormData(prev => ({ ...prev, [fieldId]: '' }));
            });
        } else if (selectedTemplate === 'custom' && newSectionTitle.trim()) {
            newSection = {
                id: `custom_${Date.now()}`,
                title: newSectionTitle,
                deletable: true,
                fields: []
            };
        }

        if (newSection) {
            setSections([...sections, newSection]);
            setNewSectionTitle('');
            setSelectedTemplate('');
            setShowAddSection(false);
        }
    };

    const handleSave = async () => {
        if (!formData.userId) return alert("User ID not found!");
        try {
            await update(ref(database, `users/${formData.userId}`), formData);
            alert('Profile updated successfully!');
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Failed to update user profile.');
        }
    };

    const handleAddField = (sectionId) => {
        const fieldName = prompt('Enter field name:');
        if (fieldName) {
            const fieldId = fieldName.toLowerCase().replace(/\s+/g, '_');
            setSections(sections.map(section => {
                if (section.id === sectionId) {
                    return {
                        ...section,
                        fields: [...section.fields, {
                            id: fieldId,
                            label: fieldName,
                            editable: true,
                            type: 'text'
                        }]
                    };
                }
                return section;
            }));
            setFormData({ ...formData, [fieldId]: '' });
        }
    };

    const handleDeleteField = (sectionId, fieldId) => {
        console.log('Deleting field:', fieldId, 'from section:', sectionId);

        setSections(sections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    fields: section.fields.filter(field => field.id !== fieldId)
                };
            }
            return section;
        }));

        setFormData(prev => {
            if (!prev[sectionId]) return prev;
            const {[fieldId]: _, ...restFields} = prev[sectionId]; 
            return {
                ...prev,
                [sectionId]: restFields
            };
        });
    };



    if (error) return <p style={{ color: 'red' }}>{error}</p>;


    const renderField = (field, sectionId, isEditingSection) => {
        const isTextarea = field.type === 'textarea';
        const isFile = field.type === 'file';
        const isPassword = field.type === 'password';
        const isEditing = isEditingSection && field.editable;
        const fieldValue = formData[sectionId]?.[field.id] || ''; 

        return (
            <div className="form-field" key={field.id}>
                <div className="field-header">
                    <label className="form-label">
                        {field.label}
                    </label>
                    {isEditingSection && field.editable && (
                        <button
                            onClick={() => handleDeleteField(sectionId, field.id)}
                            className="button-delete-field"
                            title="Delete field"
                        >
                            ×
                        </button>
                    )}
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
                        {isPassword && fieldValue ? '••••••••' : (fieldValue || 'Not set')}
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
                                    value={formData.personalInformation?.password || ''}
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
                        


                        {/* Add New Section */}
                        {/* {showAddSection ? (
                            <div className="settings-card add-section-card">
                                <div className="add-section-form">
                                    <h3 className="add-section-title">Add New Section</h3>
                                    <p className="add-section-subtitle">Choose a template or create a custom section</p>

                                    <div className="template-grid">
                                        <div
                                            className={`template-option ${selectedTemplate === 'academic' ? 'selected' : ''}`}
                                            onClick={() => setSelectedTemplate('academic')}
                                        >
                                            <div className="template-icon">🎓</div>
                                            <div className="template-title">Academic</div>
                                            <div className="template-description">School, major, GPA, graduation</div>
                                        </div>

                                        <div
                                            className={`template-option ${selectedTemplate === 'professional' ? 'selected' : ''}`}
                                            onClick={() => setSelectedTemplate('professional')}
                                        >
                                            <div className="template-icon">💼</div>
                                            <div className="template-title">Professional</div>
                                            <div className="template-description">Job, company, experience</div>
                                        </div>

                                        <div
                                            className={`template-option ${selectedTemplate === 'projects' ? 'selected' : ''}`}
                                            onClick={() => setSelectedTemplate('projects')}
                                        >
                                            <div className="template-icon">🚀</div>
                                            <div className="template-title">Projects</div>
                                            <div className="template-description">Personal projects, links</div>
                                        </div>

                                        <div
                                            className={`template-option ${selectedTemplate === 'certifications' ? 'selected' : ''}`}
                                            onClick={() => setSelectedTemplate('certifications')}
                                        >
                                            <div className="template-icon">📜</div>
                                            <div className="template-title">Certifications</div>
                                            <div className="template-description">Credentials, licenses</div>
                                        </div>

                                        <div
                                            className={`template-option ${selectedTemplate === 'skills' ? 'selected' : ''}`}
                                            onClick={() => setSelectedTemplate('skills')}
                                        >
                                            <div className="template-icon">⚡</div>
                                            <div className="template-title">Skills</div>
                                            <div className="template-description">Technical skills, languages</div>
                                        </div>

                                        <div
                                            className={`template-option ${selectedTemplate === 'volunteer' ? 'selected' : ''}`}
                                            onClick={() => setSelectedTemplate('volunteer')}
                                        >
                                            <div className="template-icon">🤝</div>
                                            <div className="template-title">Volunteer</div>
                                            <div className="template-description">Volunteer experience</div>
                                        </div>

                                        <div
                                            className={`template-option ${selectedTemplate === 'custom' ? 'selected' : ''}`}
                                            onClick={() => setSelectedTemplate('custom')}
                                        >
                                            <div className="template-icon">✨</div>
                                            <div className="template-title">Custom</div>
                                            <div className="template-description">Create your own</div>
                                        </div>
                                    </div>

                                    {selectedTemplate === 'custom' && (
                                        <input
                                            type="text"
                                            value={newSectionTitle}
                                            onChange={(e) => setNewSectionTitle(e.target.value)}
                                            placeholder="Enter custom section title..."
                                            className="form-input"
                                            autoFocus
                                        />
                                    )}

                                    <div className="button-group">
                                        <button
                                            onClick={handleAddSection}
                                            className="button-save"
                                            disabled={!selectedTemplate || (selectedTemplate === 'custom' && !newSectionTitle.trim())}
                                        >
                                            Create Section
                                        </button>
                                        <button onClick={() => {
                                            setShowAddSection(false);
                                            setNewSectionTitle('');
                                            setSelectedTemplate('');
                                        }} className="button-cancel">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAddSection(true)}
                                className="button-add-section"
                            >
                                + Add New Section
                            </button>
                        )} */}
                    </div>
                </div>
            </DefaultAppLayout>
        </Box>
    );
}