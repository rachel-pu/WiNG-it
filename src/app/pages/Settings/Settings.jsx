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
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        bio: '',
        userId: '',
        resume: '',
        schoolYear: '',
        school: '',
        major: '',
        minor: '',
        currentJob: ''
    });

    const [sections, setSections] = useState([
        {
            id: 'personal',
            title: 'Personal Information',
            deletable: false,
            fields: [
                { id: 'fullName', label: 'Full Name', editable: true, type: 'text' },
                { id: 'email', label: 'Email', editable: true, type: 'text' },
                { id: 'password', label: 'Password', editable: true, type: 'password' },
            ]
        },
        {
            id: 'academic',
            title: 'Academic Information',
            deletable: true,
            fields: [
                { id: 'bio', label: 'Bio', editable: true, type: 'textarea' },
                { id: 'school', label: 'School', editable: true, type: 'text' },
                { id: 'schoolYear', label: 'School Year', editable: true, type: 'text' },
                { id: 'major', label: 'Major', editable: true, type: 'text' },
                { id: 'minor', label: 'Minor', editable: true, type: 'text' }
            ]
        },
        {
            id: 'professional',
            title: 'Professional Information',
            deletable: true,
            fields: [
                { id: 'currentJob', label: 'Current Job/Position', editable: true, type: 'text' },
                // { id: 'resume', label: 'Resume', editable: false, type: 'file' }
            ]
        }
    ]);

        const sectionTemplates = {
        'academic': {
            title: 'Academic Information',
            fields: [
                { id: 'school', label: 'School', editable: true, type: 'text' },
                { id: 'schoolYear', label: 'School Year', editable: true, type: 'text' },
                { id: 'major', label: 'Major', editable: true, type: 'text' },
                { id: 'minor', label: 'Minor', editable: true, type: 'text' },
                { id: 'gpa', label: 'GPA', editable: true, type: 'text' },
                { id: 'graduationDate', label: 'Graduation Date', editable: true, type: 'text' }
            ]
        },
        'professional': {
            title: 'Professional Information',
            fields: [
                { id: 'currentJob', label: 'Current Job/Position', editable: true, type: 'text' },
                { id: 'company', label: 'Company', editable: true, type: 'text' },
                { id: 'yearsOfExperience', label: 'Years of Experience', editable: true, type: 'text' },
                { id: 'industry', label: 'Industry', editable: true, type: 'text' }
            ]
        },
        'projects': {
            title: 'Personal Projects',
            fields: [
                { id: 'projectName', label: 'Project Name', editable: true, type: 'text' },
                { id: 'projectDescription', label: 'Description', editable: true, type: 'textarea' },
                { id: 'projectLink', label: 'Project Link', editable: true, type: 'text' },
                { id: 'githubLink', label: 'GitHub Repository', editable: true, type: 'text' }
            ]
        },
        'certifications': {
            title: 'Certifications',
            fields: [
                { id: 'certificationName', label: 'Certification Name', editable: true, type: 'text' },
                { id: 'issuingOrganization', label: 'Issuing Organization', editable: true, type: 'text' },
                { id: 'issueDate', label: 'Issue Date', editable: true, type: 'text' },
                { id: 'certificationLink', label: 'Credential Link', editable: true, type: 'text' }
            ]
        },
        'skills': {
            title: 'Skills',
            fields: [
                { id: 'technicalSkills', label: 'Technical Skills', editable: true, type: 'textarea' },
                { id: 'languages', label: 'Programming Languages', editable: true, type: 'text' },
                { id: 'frameworks', label: 'Frameworks/Libraries', editable: true, type: 'text' },
                { id: 'tools', label: 'Tools & Technologies', editable: true, type: 'text' }
            ]
        },
        'volunteer': {
            title: 'Volunteer Experience',
            fields: [
                { id: 'organization', label: 'Organization', editable: true, type: 'text' },
                { id: 'role', label: 'Role', editable: true, type: 'text' },
                { id: 'duration', label: 'Duration', editable: true, type: 'text' },
                { id: 'volunteerDescription', label: 'Description', editable: true, type: 'textarea' }
            ]
        },
        'custom': {
            title: '',
            fields: []
        }
    };

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

    const handleSaveSection = async (sectionId) => {
        setEditingSection(null);
        if (!formData.userId) {
            alert("User ID not found!");
            return;
        }

        try {

            const section = sections.find(sec => sec.id === sectionId);
            if (!section) return;

            const updates = {};
            section.fields.forEach(field => {
                updates[field.id] = formData[field.id] || '';
            });

            await update(ref(database, `users/${formData.userId}`), updates);
            alert('Section updated successfully!');
        } catch (err) {
            console.error('Error updating section:', err);
            alert('Failed to update section.');
        }
        console.log('Saved section:', section);
    };

    const handleCancelSection = () => {
        setEditingSection(null);
        // Here you would typically reset formData to previous values
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
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
            // Initialize the field in formData
            setFormData({ ...formData, [fieldId]: '' });
        }
    };

    const handleDeleteField = (sectionId, fieldId) => {
        setSections(sections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    fields: section.fields.filter(field => field.id !== fieldId)
                };
            }
            return section;
        }));
    };


    if (error) return <p style={{ color: 'red' }}>{error}</p>;


    const renderField = (field, sectionId, isEditingSection) => {
        const isTextarea = field.type === 'textarea';
        const isFile = field.type === 'file';
        const isPassword = field.type === 'password';
        const isEditing = isEditingSection && field.editable;

        // if (isFile) {
        //     return (
        //         <div className="form-field" key={field.id}>
        //             <label className="form-label">Resume</label>
        //             <div className="resume-section">
        //                 <div className="resume-filename">{formData.resume}</div>
        //                 <button className="button-upload">
        //                     Upload New
        //                 </button>
        //                 <button className="button-download">
        //                     Download
        //                 </button>
        //             </div>
        //         </div>
        //     );
        // }

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
                            value={formData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="form-textarea"
                        />
                    ) : (
                        <input
                            type="text"
                            value={formData[field.id] || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="form-input"
                        />
                    )
                ) : (
                    <div className={`form-display ${isTextarea ? 'textarea-display' : ''} ${!field.editable ? 'disabled' : ''}`}>
                        {isPassword && formData[field.id] ? '••••••••' : (formData[field.id] || 'Not set')}
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
                        
                        
                        {sections.slice(0, 1).map(section => (
                            <div className="settings-card" key={section.id}>
                                <h2>{section.title}</h2>
                            <div className="settings-card-header"></div>
                            {section.fields.map(field => (
                            renderField(field, section.id, editingSection === section.id)
                            ))}
                           </div>  
                        ))}
                        
                    
                        {sections.slice(1).map(section => (
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
                                                {section.deletable && (
                                                    <button
                                                        onClick={() => handleDeleteSection(section.id)}
                                                        className="button-delete"
                                                        title="Delete section"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {section.fields.map(field => renderField(field, section.id, editingSection === section.id))}

                                {editingSection === section.id && (
                                    <button
                                        onClick={() => handleAddField(section.id)}
                                        className="button-add-field"
                                    >
                                        + Add Field
                                    </button>
                                )}
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