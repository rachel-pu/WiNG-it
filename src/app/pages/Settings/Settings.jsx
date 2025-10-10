import { useState } from 'react';
import Box from '@mui/material/Box';
import DefaultAppLayout from "../../DefaultAppLayout.jsx";
import "./Settings.css"
export default function Settings() {
    const [formData, setFormData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: '••••••••',
        bio: 'Software engineering student passionate about web development and AI.',
        userId: 'UID-2024-12345',
        resume: 'resume_john_doe_2024.pdf',
        schoolYear: 'Junior',
        school: 'University of Florida',
        major: 'Computer Science',
        minor: 'Mathematics',
        currentJob: 'Software Engineering Intern at Tech Corp'
    });

    const [editMode, setEditMode] = useState({});

    const handleEdit = (field) => {
        setEditMode({ ...editMode, [field]: true });
    };

    const handleSave = (field) => {
        setEditMode({ ...editMode, [field]: false });
        // Here you would typically save to backend
        console.log('Saved:', field, formData[field]);
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const renderField = (label, field, editable = true) => {
        const isEditing = editMode[field];
        const isTextarea = field === 'bio';

        return (
            <div className="form-field">
                <label className="form-label">
                    {label}
                </label>
                <div className="form-row">
                    {isEditing ? (
                        isTextarea ? (
                            <textarea
                                value={formData[field]}
                                onChange={(e) => handleChange(field, e.target.value)}
                                className="form-textarea"
                            />
                        ) : (
                            <input
                                type="text"
                                value={formData[field]}
                                onChange={(e) => handleChange(field, e.target.value)}
                                className="form-input"
                            />
                        )
                    ) : (
                        <div className={`form-display ${isTextarea ? 'textarea-display' : ''}`}>
                            {formData[field] || 'Not set'}
                        </div>
                    )}
                    {editable && (
                        <button
                            onClick={() => isEditing ? handleSave(field) : handleEdit(field)}
                            className={isEditing ? 'button-save' : 'button-edit'}
                        >
                            {isEditing ? 'Save' : 'Edit'}
                        </button>
                    )}
                </div>
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

                        {/* Personal Information Section */}
                        <div className="settings-card">
                            <h2>Personal Information</h2>
                            
                            <div className="settings-grid-2">
                                <div>
                                    {renderField('First Name', 'firstName')}
                                </div>
                                <div>
                                    {renderField('Last Name', 'lastName')}
                                </div>
                            </div>

                            {renderField('User ID', 'userId', false)}
                            {renderField('Email', 'email', false)}
                            {renderField('Password', 'password', false)}
                            {renderField('Bio', 'bio')}
                        </div>

                        {/* Academic Information Section */}
                        <div className="settings-card">
                            <h2>Academic Information</h2>
                            
                            {renderField('School', 'school')}
                            {renderField('School Year', 'schoolYear')}
                            
                            <div className="settings-grid-2">
                                <div>
                                    {renderField('Major', 'major')}
                                </div>
                                <div>
                                    {renderField('Minor', 'minor')}
                                </div>
                            </div>
                        </div>

                        {/* Professional Information Section */}
                        <div className="settings-card">
                            <h2>Professional Information</h2>

                            {renderField('Current Job/Position', 'currentJob')}

                            <div className="form-field">
                                <label className="form-label">Resume</label>
                                <div className="resume-section">
                                    <div className="resume-filename">{formData.resume}</div>
                                    <button className="button-upload">
                                        Upload New
                                    </button>
                                    <button className="button-download">
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DefaultAppLayout>
        </Box>
    );
}