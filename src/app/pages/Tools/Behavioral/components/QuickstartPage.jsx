"use client";
import "./QuickstartPage.css";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { Button, Typography, Alert, Fade, Tabs, Tab } from "@mui/material";
import { motion } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs";
import { ref, get } from "firebase/database";
import {database} from '../../../../../lib/firebase.jsx'
import { useNavigate } from "react-router-dom";

// Material-UI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import MicIcon from '@mui/icons-material/Mic';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GroupIcon from '@mui/icons-material/Group';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Person3 from '@mui/icons-material/Person3';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsIcon from '@mui/icons-material/Settings';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BuildIcon from '@mui/icons-material/Build';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import StickyNote2 from '@mui/icons-material/StickyNote2';

const QuickstartPage = ({
    error,
    jobRole,
    company,
    numQuestions,
    questionTypes,
    interviewerDifficulty,
    customQuestions,
    setError,
    setResume,
    handleQuestionsChange,
    handleJobRoleChange,
    handleCompanyChange,
    handleQuestionTypesChange,
    handleGetStarted,
    handleInterviewerDifficultyChange,
    handleCustomQuestionsChange,
}) => {
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("error");
    const [selectedTab, setSelectedTab] = useState(0);
    const [userId, setUserId] = useState("");
    const [haveResume, setHaveResume] = useState(false);
    const navigate = useNavigate();

    // Show alert when error prop changes
    useEffect(() => {
        if (error) {
            setAlertMessage(error);
            setAlertSeverity("error");
            setShowAlert(true);
        }
    }, [error]);

    //grab resume
    useEffect(() => {
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const userId = getCookie('user_id');
        if (userId) {
            setUserId(userId);
        } else {
            console.log('No user_id cookie found');
        }
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                const snapshot = await get(ref(database, `users/${userId}`));
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    try {
                        if (userData.resume != ""){
                            const text = await extractTextFromPDF(userData.resume);
                            setResume(text);
                            setHaveResume(true);
                        }
                    } catch (error) {
                        console.log("User resume is not uploaded yet")
                    }
                } else {
                    setError('User not found in database.');
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to fetch user data.');
            }
        };
        fetchUser();
    }, [userId]);

    const extractTextFromPDF = async (url) => {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        let allText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(" ");
            allText += pageText + "\n";
        }

        return allText;
    };
        

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const itemVariants = {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 },
        transition: { type: "spring" },
    };

    const questionTypeOptions = [
        { id: 'situational', label: 'Situational', icon: BusinessCenterIcon },
        { id: 'problem-solving', label: 'Problem-solving', icon: PsychologyIcon },
        { id: 'leadership', label: 'Leadership', icon: AutoAwesomeIcon },
        { id: 'teamwork', label: 'Teamwork', icon: GroupIcon }
    ];

    const difficultyLevels = [
        { id: 'easy-going-personality', label: 'Easy-going', description: 'Friendly and relaxed interviewer' },
        { id: 'professional-personality', label: 'Professional', description: 'Standard corporate interview style' },
        { id: 'intense-personality', label: 'Intense', description: 'Challenging and demanding interviewer' },
        { id: 'randomize-personality', label: 'Randomize', description: 'Mix of different interviewer styles' }
    ];

    const steps = [
        {
            title: "Practice Tool",
            description: "This is a simulation, not a real interview assessment",
            icon: BuildIcon,
            color: "blue"
        },
        {
            title: "No Skipping",
            description: "Like real interviews, you must answer all questions",
            icon: WarningIcon,
            color: "amber"
        },
        {
            title: "Voice Recording",
            description: "Microphone access required for voice responses",
            icon: MicIcon,
            color: "green"
        },
        {
            title: "Stay Focused",
            description: "Exiting will reset your progress and results",
            icon: GpsFixedIcon,
            color: "purple"
        }
    ];

    const handleQuestionTypeToggle = (typeId) => {
        const currentTypes = questionTypes || [];
        const newTypes = currentTypes.includes(typeId)
            ? currentTypes.filter(id => id !== typeId)
            : [...currentTypes, typeId];
        handleQuestionTypesChange({ target: { value: newTypes } });
    };

    const handleStartButtonClick = () => {
        handleGetStarted(selectedTab);
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const handleCustomQuestionsInput = (e) => {
        const value = e.target.value;
        const questionCount = value.split('\n').filter(q => q.trim()).length;

        if (questionCount > 5) {
            setAlertMessage('Maximum 5 questions allowed');
            setAlertSeverity('warning');
            setShowAlert(true);
            return;
        }

        handleCustomQuestionsChange(e);
    };

    return (
        <Box component="main" className="QuickStartPage-main-modern">
            <div className="QuickStartPage-content-grid">
                {/* Instructions Panel */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.2 }}
                    variants={itemVariants}
                    className="QuickStartPage-instructions-panel"
                >
                    <div className="QuickStartPage-panel-header">
                        <div className="QuickStartPage-panel-header-icon blue">
                            <CheckCircleIcon />
                        </div>
                        <Typography className="QuickStartPage-panel-title">How It Works</Typography>
                    </div>

                    <div className="QuickStartPage-steps-container">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    variants={itemVariants}
                                    className="QuickStartPage-step-item"
                                >
                                    <div className={`QuickStartPage-step-icon ${step.color}`}>
                                        <Icon />
                                    </div>
                                    <div className="QuickStartPage-step-content">
                                        <Typography className="QuickStartPage-step-title">{step.title}</Typography>
                                        <Typography className="QuickStartPage-step-description">{step.description}</Typography>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.8 }}
                        variants={itemVariants}
                        className="QuickStartPage-pro-tip"
                    >
                        <div className="QuickStartPage-pro-tip-header">
                            <AutoAwesomeIcon />
                            <span>Pro Tip</span>
                        </div>
                        <Typography className="QuickStartPage-pro-tip-text">
                            Treat this as a real interview for maximum benefit. Practice your STAR method responses!
                        </Typography>
                    </motion.div>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.8 }}
                        variants={itemVariants}
                        className="QuickStartPage-winnie-intro"
                    >
                        <div className="QuickStartPage-winnie-intro-header">
                            <Person3 />
                            <span>Winnie</span>
                        </div>
                        <Typography className="QuickStartPage-winnie-intro-text">
                            Winnie will be your virtual interviewer. She's an objective evaluator who scores your answers purely by their stats: length, wording, and how closely they follow the STAR Method.                        </Typography>
                    </motion.div>
                </motion.div>

                {/* Configuration Panel */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 }}
                    variants={itemVariants}
                    className="QuickStartPage-config-panel"
                >
                    <div className="QuickStartPage-panel-header">
                        <div className="QuickStartPage-panel-header-icon purple">
                            <SettingsIcon />
                        </div>
                        <Typography className="QuickStartPage-panel-title">Customize Your Interview</Typography>
                    </div>

                    {/* Tabs */}
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        className="interview-tabs"
                        sx={{
                            marginBottom: '1.5rem',
                            '& .MuiTab-root': {
                                fontFamily: '"DM Sans", sans-serif',
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#64748b',
                                minHeight: '48px',
                            },
                            '& .Mui-selected': {
                                color: '#7c3aed !important',
                                fontFamily: '"Satoshi Bold", sans-serif',
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#7c3aed',
                                height: '3px',
                                borderRadius: '3px 3px 0 0',
                            },
                        }}
                    >
                        <Tab
                            icon={<AutoFixHighIcon />}
                            iconPosition="start"
                            label="AI-Generated Questions"
                        />
                        <Tab
                            icon={<StickyNote2 />}
                            iconPosition="start"
                            label="Resume Focused Questions"
                        />
                        <Tab
                            icon={<EditNoteIcon />}
                            iconPosition="start"
                            label="Custom Questions"
                        />
                    </Tabs>

                    <div className="QuickStartPage-config-form">
                        {/* AI-Generated Questions Tab */}
                        {selectedTab === 0 && (
                            <>
                                {/* Job Role and Company Inputs - Side by Side */}
                                <div className="QuickStartPage-form-group-row">
                                    <div className="QuickStartPage-form-group-half">
                                        <label className="QuickStartPage-form-label">Target Role</label>
                                        <input
                                            type="text"
                                            value={jobRole}
                                            onChange={handleJobRoleChange}
                                            placeholder="e.g. Software Engineer"
                                            className="QuickStartPage-form-input"
                                        />
                                    </div>
                                    <div className="QuickStartPage-form-group-half">
                                        <label className="QuickStartPage-form-label">Company</label>
                                        <input
                                            type="text"
                                            value={company}
                                            onChange={handleCompanyChange}
                                            placeholder="e.g. Google, Amazon"
                                            className="QuickStartPage-form-input"
                                        />
                                    </div>
                                </div>

                                {/* Number of Questions */}
                                <div className="QuickStartPage-form-group">
                                    <label className="QuickStartPage-form-label">Number of Questions</label>
                                    <div className="QuickStartPage-number-selector">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => handleQuestionsChange({ target: { value: num } })}
                                                className={`QuickStartPage-number-btn ${numQuestions === num ? 'active' : ''}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Types */}
                                <div className="QuickStartPage-form-group">
                                    <label className="QuickStartPage-form-label">Question Types</label>
                                    <div className="QuickStartPage-question-types">
                                        {questionTypeOptions.map((type) => {
                                            const Icon = type.icon;
                                            const currentTypes = Array.isArray(questionTypes) ? questionTypes : [];
                                            const isSelected = currentTypes.includes(type.id);

                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => handleQuestionTypeToggle(type.id)}
                                                    className={`QuickStartPage-type-btn ${isSelected ? 'selected' : ''}`}
                                                >
                                                    <Icon />
                                                    <span>{type.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {(!questionTypes || (Array.isArray(questionTypes) && questionTypes.length === 0)) && (
                                        <Typography className="QuickStartPage-helper-text">Leave empty for random selection</Typography>
                                    )}
                                </div>

                                {/* Interviewer Difficulty */}
                                <div className="QuickStartPage-form-group">
                                    <label className="QuickStartPage-form-label">Interviewer Style</label>
                                    <div className="QuickStartPage-difficulty-options">
                                        {difficultyLevels.map((level) => (
                                            <button
                                                key={level.id}
                                                onClick={() => handleInterviewerDifficultyChange(level.id)}
                                                className={`QuickStartPage-difficulty-btn ${interviewerDifficulty === level.id ? 'active' : ''}`}
                                            >
                                                <div className="QuickStartPage-difficulty-label">{level.label}</div>
                                                <div className="QuickStartPage-difficulty-description">{level.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {selectedTab === 1 && (
                        haveResume ? (
                            <>
                                {/* Job Role and Company Inputs - Side by Side */}
                                <div className="QuickStartPage-form-group-row">
                                    <div className="QuickStartPage-form-group-half">
                                        <label className="QuickStartPage-form-label">Target Role</label>
                                        <input
                                            type="text"
                                            value={jobRole}
                                            onChange={handleJobRoleChange}
                                            placeholder="e.g. Software Engineer"
                                            className="QuickStartPage-form-input"
                                        />
                                    </div>
                                    <div className="QuickStartPage-form-group-half">
                                        <label className="QuickStartPage-form-label">Company</label>
                                        <input
                                            type="text"
                                            value={company}
                                            onChange={handleCompanyChange}
                                            placeholder="e.g. Google, Amazon"
                                            className="QuickStartPage-form-input"
                                        />
                                    </div>
                                </div>

                                {/* Number of Questions */}
                                <div className="QuickStartPage-form-group">
                                    <label className="QuickStartPage-form-label">Number of Questions</label>
                                    <div className="QuickStartPage-number-selector">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => handleQuestionsChange({ target: { value: num } })}
                                                className={`QuickStartPage-number-btn ${numQuestions === num ? 'active' : ''}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Interviewer Difficulty */}
                                <div className="QuickStartPage-form-group">
                                    <label className="QuickStartPage-form-label">Interviewer Style</label>
                                    <div className="QuickStartPage-difficulty-options">
                                        {difficultyLevels.map((level) => (
                                            <button
                                                key={level.id}
                                                onClick={() => handleInterviewerDifficultyChange(level.id)}
                                                className={`QuickStartPage-difficulty-btn ${interviewerDifficulty === level.id ? 'active' : ''}`}
                                            >
                                                <div className="QuickStartPage-difficulty-label">{level.label}</div>
                                                <div className="QuickStartPage-difficulty-description">{level.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                            ) : (
                                <div>
                                    <Typography sx={{ fontFamily: 'Satoshi', marginTop: '1rem', textAlign: 'center', color: 'gray' }}>
                                    Please upload your resume in the Settings page to use this feature.
                                    </Typography>
                                    <Button
                                        onClick={() => navigate("/settings")}
                                        className="QuickStartPage-start-button"
                                        style={{top:'30px', height: '50px'}}
                                    >
                                        Navigate to Settings
                                    </Button>
                                </div>
                            )
                        )}

                        {/* Custom Questions Tab */}
                        {selectedTab === 2 && (
                            <div className="QuickStartPage-custom-questions-container">
                                <div className="QuickStartPage-form-group">
                                    <label className="QuickStartPage-form-label">Enter Your Questions</label>
                                    <Typography className="QuickStartPage-helper-text" sx={{ marginBottom: '0.75rem' }}>
                                        Enter one question per line. You can add up to 5 questions.
                                    </Typography>
                                    <textarea
                                        value={customQuestions}
                                        onChange={handleCustomQuestionsInput}
                                        placeholder="e.g.&#10;Tell me about a time you faced a difficult challenge.&#10;Describe a situation where you had to work with a difficult team member.&#10;How do you handle tight deadlines?"
                                        className="QuickStartPage-custom-questions-textarea"
                                        rows={10}
                                    />
                                    <Typography className="QuickStartPage-helper-text" sx={{ marginTop: '0.5rem', textAlign: 'right' }}>
                                        {customQuestions.split('\n').filter(q => q.trim()).length} / 5 questions
                                    </Typography>
                                </div>

                                {/* Interviewer Difficulty for Custom Questions */}
                                <div className="QuickStartPage-form-group">
                                    <label className="QuickStartPage-form-label">Interviewer Style</label>
                                    <div className="QuickStartPage-difficulty-options">
                                        {difficultyLevels.map((level) => (
                                            <button
                                                key={level.id}
                                                onClick={() => handleInterviewerDifficultyChange(level.id)}
                                                className={`QuickStartPage-difficulty-btn ${interviewerDifficulty === level.id ? 'active' : ''}`}
                                            >
                                                <div className="QuickStartPage-difficulty-label">{level.label}</div>
                                                <div className="QuickStartPage-difficulty-description">{level.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Start Button */}
            <motion.div
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.7 }}
                variants={itemVariants}
                className="QuickStartPage-start-button-container"
            >
                <Button
                    onClick={handleStartButtonClick}
                    className="QuickStartPage-start-button"
                >
                    <PlayArrowIcon />
                    Start Your Interview
                    <ArrowForwardIcon />
                </Button>

            </motion.div>

            {/* Top notification alert */}
            <Fade in={showAlert} timeout={300}>
                <Box className="QuickStartPage-alert-container">
                    <Alert
                        severity={alertSeverity}
                        onClose={() => setShowAlert(false)}
                        className="QuickStartPage-alert"
                        sx={{
                            '& .MuiAlert-message': {
                                fontFamily: '"Satoshi Medium", sans-serif',
                            }
                        }}
                    >
                        {alertMessage}
                    </Alert>
                </Box>
            </Fade>
        </Box>
    );
};

export default QuickstartPage;
