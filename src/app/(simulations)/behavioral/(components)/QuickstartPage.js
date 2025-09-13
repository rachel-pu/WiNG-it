"use client";
import "./QuickstartPage.css";
import Toolbar from "@mui/material/Toolbar";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import { Button, Typography, Switch, FormControlLabel } from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Material-UI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import MicIcon from '@mui/icons-material/Mic';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GroupIcon from '@mui/icons-material/Group';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsIcon from '@mui/icons-material/Settings';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BuildIcon from '@mui/icons-material/Build';

const QuickstartPage = ({
    error,
    jobRole,
    numQuestions,
    questionTypes,
    interviewerDifficulty,
    handleQuestionsChange,
    handleJobRoleChange,
    handleQuestionTypesChange,
    handleGetStarted,
    handleInterviewerDifficultyChange,
}) => {

    const itemVariants = {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 },
        transition: { type: "spring" },
    };

    const questionTypeOptions = [
        { id: 'situational', label: 'Situational', icon: BusinessCenterIcon },
        { id: 'problem-solving', label: 'Problem-solving', icon: PsychologyIcon },
        { id: 'technical', label: 'Technical', icon: FlashOnIcon },
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

    return (
        <Box component="main" className="quickstart-main-modern">
            <Toolbar />

            {/* Header */}
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                variants={itemVariants}
                className="quickstart-header"
            >
                <Typography className="quickstart-title-modern">
                    Interview Practice
                </Typography>
                <Typography className="quickstart-description-modern">
                    Master your behavioral interview skills with personalized AI feedback. 
                    Practice like it&apos;s the real thing and boost your confidence.
                </Typography>
            </motion.div>

            <div className="quickstart-content-grid">
                {/* Instructions Panel */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    variants={itemVariants}
                    className="quickstart-instructions-panel"
                >
                    <div className="panel-header">
                        <div className="panel-header-icon blue">
                            <CheckCircleIcon />
                        </div>
                        <Typography className="panel-title">How It Works</Typography>
                    </div>
                    
                    <div className="steps-container">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div 
                                    key={index}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    variants={itemVariants}
                                    className="step-item"
                                >
                                    <div className={`step-icon ${step.color}`}>
                                        <Icon />
                                    </div>
                                    <div className="step-content">
                                        <Typography className="step-title">{step.title}</Typography>
                                        <Typography className="step-description">{step.description}</Typography>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                        variants={itemVariants}
                        className="pro-tip"
                    >
                        <div className="pro-tip-header">
                            <AutoAwesomeIcon />
                            <span>Pro Tip</span>
                        </div>
                        <Typography className="pro-tip-text">
                            Treat this as a real interview for maximum benefit. Practice your STAR method responses!
                        </Typography>
                    </motion.div>
                </motion.div>

                {/* Configuration Panel */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    variants={itemVariants}
                    className="quickstart-config-panel"
                >
                    <div className="panel-header">
                        <div className="panel-header-icon purple">
                            <SettingsIcon />
                        </div>
                        <Typography className="panel-title">Customize Your Interview</Typography>
                    </div>

                    <div className="config-form">
                        {/* Job Role Input */}
                        <div className="form-group">
                            <label className="form-label">Target Role</label>
                            {error && <p className="error-text">{error}</p>}
                            <input
                                type="text"
                                value={jobRole}
                                onChange={handleJobRoleChange}
                                placeholder="e.g. Software Engineer, Product Manager"
                                className="form-input"
                            />
                        </div>

                        {/* Number of Questions */}
                        <div className="form-group">
                            <label className="form-label">Number of Questions</label>
                            <div className="number-selector">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleQuestionsChange({ target: { value: num } })}
                                        className={`number-btn ${numQuestions === num ? 'active' : ''}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Types */}
                        <div className="form-group">
                            <label className="form-label">Question Types</label>
                            <div className="question-types">
                                {questionTypeOptions.map((type) => {
                                    const Icon = type.icon;
                                    const currentTypes = Array.isArray(questionTypes) ? questionTypes : [];
                                    const isSelected = currentTypes.includes(type.id);
                                    
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => handleQuestionTypeToggle(type.id)}
                                            className={`type-btn ${isSelected ? 'selected' : ''}`}
                                        >
                                            <Icon />
                                            <span>{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {(!questionTypes || (Array.isArray(questionTypes) && questionTypes.length === 0)) && (
                                <Typography className="helper-text">Leave empty for random selection</Typography>
                            )}
                        </div>

                        {/* Interviewer Difficulty */}
                        <div className="form-group">
                            <label className="form-label">Interviewer Style</label>
                            <div className="difficulty-options">
                                {difficultyLevels.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => handleInterviewerDifficultyChange(level.id)}
                                        className={`difficulty-btn ${interviewerDifficulty === level.id ? 'active' : ''}`}
                                    >
                                        <div className="difficulty-label">{level.label}</div>
                                        <div className="difficulty-description">{level.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Start Button */}
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                variants={itemVariants}
                className="start-button-container"
            >
                <Button
                    onClick={handleGetStarted}
                    className="start-button"
                >
                    <PlayArrowIcon />
                    Start Your Interview
                    <ArrowForwardIcon />
                </Button>
                
                <Typography className="start-button-subtitle">
                    Ready when you are! Good luck!
                </Typography>
            </motion.div>
        </Box>
    );
};

export default QuickstartPage;