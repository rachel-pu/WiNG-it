import { useState, useEffect } from 'react';
import { ref, update, get } from "firebase/database";
import { database } from '../../../../lib/firebase.jsx';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { supabase } from '../../../../../supabase.js';
import { ChevronRight, ChevronLeft, Check, User, GraduationCap, BookOpen } from 'lucide-react';
import "./Onboarding.css";

export default function Onboarding() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        userId: '',
        academicInformation: {
            bio: '',
            school: '',
            schoolYear: '',
            major: '',
            minor: ''
        },
        professionalInformation: {
            currentJob: ''
        }
    });

    const totalSteps = 3;

    useEffect(() => {
        const fetchSession = async () => {
            try {
            const { data, error } = await supabase.auth.getSession();
            if (error || !data.session) {
                setError('User session not found. Please log in.');
                return;
            }

            const userId = data.session.user.id;

            // Set in state directly
            setFormData(prev => ({ ...prev, userId }));

            // Optional: set cookie if you need it
            document.cookie = `user_id=${userId}; path=/; max-age=604800; secure; samesite=strict`;

            // Check if onboarding is already completed
            const snapshot = await get(ref(database, `users/${userId}/onboardingCompleted`));
            if (snapshot.exists() && snapshot.val() === true) {
                navigate('/dashboard');
            }
            } catch (err) {
            console.error('Error fetching session or onboarding status:', err);
            setError('Failed to verify user session.');
            }
        };

        fetchSession();
    }, [navigate]);



    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const validateStep = (step) => {
        if (step === 1) {
            if (!formData.academicInformation.bio.trim()) {
                setError('Please tell us a bit about yourself');
                return false;
            }
        } else if (step === 2) {
            if (!formData.academicInformation.school.trim()) {
                setError('Please enter your school name');
                return false;
            }
            if (!formData.academicInformation.schoolYear) {
                setError('Please select your school year');
                return false;
            }
        } else if (step === 3) {
            if (!formData.academicInformation.major.trim()) {
                setError('Please enter your major');
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError('');
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            return;
        }

        if (!formData.userId) {
            setError("User ID not found!");
            return;
        }

        try {
            await update(ref(database, `users/${formData.userId}`), {
                academicInformation: formData.academicInformation,
                professionalInformation: formData.professionalInformation,
                onboardingCompleted: true
            });

            await supabase.auth.updateUser({ data: { onboarded: true } });
            // Redirect to dashboard or home page
            navigate('/dashboard');
        } catch (err) {
            console.error('Error saving onboarding data:', err);
            setError('Failed to save your information. Please try again.');
        }
    };

    const schoolYears = [
        'Freshman',
        'Sophomore',
        'Junior',
        'Senior',
        'Graduate Student',
        'PhD Candidate',
        'Professional',
        'Other'
    ];

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="Onboarding-step-content">
                        <div className="Onboarding-step-icon">
                            <User size={48} />
                        </div>
                        <h2 className="Onboarding-step-title">Tell us about yourself</h2>

                        <div className="Onboarding-form-group">
                            <textarea
                                value={formData.academicInformation.bio}
                                onChange={(e) => handleChange('academicInformation', 'bio', e.target.value)}
                                placeholder="Tell us about your interests, goals, and what brings you here..."
                                className="Onboarding-form-textarea-large"
                                rows={6}
                            />
                            <div className="Onboarding-character-count">
                                {formData.academicInformation.bio.length} / 500
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="Onboarding-step-content">
                        <div className="Onboarding-step-icon">
                            <GraduationCap size={48} />
                        </div>
                        <h2 className="Onboarding-step-title">Academic Information</h2>
                        <p className="Onboarding-step-description">
                            Tell us about your educational background.
                        </p>

                        <div className="Onboarding-form-group">
                            <label className="Onboarding-form-label">School / University</label>
                            <input
                                type="text"
                                value={formData.academicInformation.school}
                                onChange={(e) => handleChange('academicInformation', 'school', e.target.value)}
                                placeholder="e.g., University of Florida"
                                className="Onboarding-form-input-large"
                            />
                        </div>

                        <div className="Onboarding-form-group">
                            <label className="Onboarding-form-label">School Year</label>
                            <div className="Onboarding-school-year-grid">
                                {schoolYears.map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => handleChange('academicInformation', 'schoolYear', year)}
                                        className={`Onboarding-year-option ${formData.academicInformation.schoolYear === year ? 'Onboarding-selected' : ''}`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="Onboarding-step-content">
                        <div className="Onboarding-step-icon">
                            <BookOpen size={48} />
                        </div>
                        <h2 className="Onboarding-step-title">Field of Study</h2>
                        <p className="Onboarding-step-description">
                            Please indicate your current or most recent field of study.
                        </p>

                        <div className="Onboarding-form-group">
                            <label className="Onboarding-form-label">Major</label>
                            <input
                                type="text"
                                value={formData.academicInformation.major}
                                onChange={(e) => handleChange('academicInformation', 'major', e.target.value)}
                                placeholder="e.g., Computer Science"
                                className="Onboarding-form-input-large"
                            />
                        </div>

                        <div className="Onboarding-form-group">
                            <label className="Onboarding-form-label">Minor (Optional)</label>
                            <input
                                type="text"
                                value={formData.academicInformation.minor}
                                onChange={(e) => handleChange('academicInformation', 'minor', e.target.value)}
                                placeholder="e.g., Mathematics"
                                className="Onboarding-form-input-large"
                            />
                        </div>

                        <div className="Onboarding-form-group">
                            <label className="Onboarding-form-label">Current Job</label>
                            <input
                                type="text"
                                value={formData.professionalInformation.currentJob}
                                onChange={(e) => handleChange('professionalInformation', 'currentJob', e.target.value)}
                                placeholder="e.g., Student, Software Engineer"
                                className="Onboarding-form-input-large"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Box>
            <div className="Onboarding-onboarding-page">
                <div className="Onboarding-onboarding-container">
                    {/* Progress Bar */}
                    <div className="Onboarding-progress-section">
                        <div className="Onboarding-progress-bar">
                            {[...Array(totalSteps)].map((_, index) => (
                                <div
                                    key={index}
                                    className={`Onboarding-progress-step ${index + 1 <= currentStep ? 'Onboarding-active' : ''} ${index + 1 < currentStep ? 'Onboarding-completed' : ''}`}
                                >
                                    {index + 1 < currentStep ? (
                                        <Check size={16} />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="Onboarding-progress-text">
                            Step {currentStep} of {totalSteps}
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <div className="Onboarding-onboarding-card">
                        {renderStep()}

                        {/* Error Message */}
                        {error && (
                            <div className="Onboarding-error-message">
                                {error}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="Onboarding-button-group">
                            {currentStep > 1 && (
                                <button
                                    onClick={handleBack}
                                    className="Onboarding-button-secondary"
                                >
                                    <ChevronLeft size={20} />
                                    Back
                                </button>
                            )}

                            {currentStep < totalSteps ? (
                                <button
                                    onClick={handleNext}
                                    className="Onboarding-button-primary"
                                >
                                    Next
                                    <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="Onboarding-button-primary"
                                >
                                    Complete Setup
                                    <Check size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="Onboarding-skip-section">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="Onboarding-skip-button"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </div>
        </Box>
    );
}