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

    const [editingSection, setEditingSection] = useState(null);

    const handleEditSection = (section) => {
        setEditingSection(section);
    };

    const handleSaveSection = (section) => {
        setEditingSection(null);
        // Here you would typically save to backend
        console.log('Saved section:', section);
    };

    const handleCancelSection = () => {
        setEditingSection(null);
        // Here you would typically reset formData to previous values
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const renderField = (label, field, isEditable = true) => {
        const isTextarea = field === 'bio';
        const isEditing = editingSection && isEditable;

        return (
            <div className="form-field">
                <label className="form-label">
                    {label}
                </label>
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
                    <div className={`form-display ${isTextarea ? 'textarea-display' : ''} ${!isEditable ? 'disabled' : ''}`}>
                        {formData[field] || 'Not set'}
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

                        {/* Personal Information Section */}
                        <div className="settings-card">
                            <div className="settings-card-header">
                                <h2>Personal Information</h2>
                                {editingSection === 'personal' ? (
                                    <div className="button-group">
                                        <button
                                            onClick={() => handleSaveSection('personal')}
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
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleEditSection('personal')}
                                        className="button-edit"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className="settings-grid-2">
                                <div>
                                    {renderField('First Name', 'firstName')}
                                </div>
                                <div>
                                    {renderField('Last Name', 'lastName')}
                                </div>
                            </div>

                            {renderField('User ID', 'userId', false)}
                            {renderField('Email', 'email')}
                            {renderField('Password', 'password', false)}
                            {renderField('Bio', 'bio')}
                        </div>

                        {/* Academic Information Section */}
                        <div className="settings-card">
                            <div className="settings-card-header">
                                <h2>Academic Information</h2>
                                {editingSection === 'academic' ? (
                                    <div className="button-group">
                                        <button
                                            onClick={() => handleSaveSection('academic')}
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
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleEditSection('academic')}
                                        className="button-edit"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

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
                            <div className="settings-card-header">
                                <h2>Professional Information</h2>
                                {editingSection === 'professional' ? (
                                    <div className="button-group">
                                        <button
                                            onClick={() => handleSaveSection('professional')}
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
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleEditSection('professional')}
                                        className="button-edit"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

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