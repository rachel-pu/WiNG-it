"use client";

import React from "react";
import { Box, Typography, Grid2 as Grid, Card, CssBaseline, Toolbar } from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DefaultAppLayout from "../../../DefaultAppLayout";
import "./InterviewCompleteScreen.css";

const InterviewCompleteScreen = ({
    overallScore,
    totalQuestions,
    totalAverageRecordedTime,
    questionData,
    overallTips,
    onViewDetails
}) => {
    // Calculate averages
    const avgFillerWords = Math.round(
        Object.values(questionData).reduce((sum, q) => sum + q.fillerWords, 0) / totalQuestions
    );
    const avgActionWords = Math.round(
        Object.values(questionData).reduce((sum, q) => sum + q.actionWords, 0) / totalQuestions
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", damping: 20, stiffness: 300 }
        }
    };

    return (
        <Box sx={{ display: "flex", width: "100%", height: "100vh" }}>
            <CssBaseline />
            <DefaultAppLayout elevation={16} title="Interview Results" color="#2850d9" titlecolor="#FFFFFF">
                <Box className="interview-complete-container">
            {/* Decorative Background Elements */}
            <Box className="decorative-circle-top" />
            <Box className="decorative-circle-bottom" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="interview-complete-content"
            >
                {/* Main Celebration Section */}
                <motion.div variants={itemVariants}>
                    <Box className="celebration-section">
                        <Typography className="celebration-title">
                            Interview Complete! 🎉
                        </Typography>
                        <Typography className="celebration-subtitle">
                            You answered {totalQuestions} behavioral interview questions
                        </Typography>
                    </Box>
                </motion.div>

                {/* Two Column Layout */}
                <motion.div variants={itemVariants}>
                    <div className="two-column-layout">
                        {/* Left Column - Performance and Stats */}
                        <div className="left-column">
                            {/* Score Display */}
                            <Card className="score-card">
                                <Typography className="score-label">
                                    Your Overall Performance
                                </Typography>

                                <Box className="score-display">
                                    <Box className="circular-progress-container">
                                        <svg className="circular-progress" viewBox="0 0 120 120">
                                            {/* Background circle */}
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="50"
                                                className="progress-bg"
                                            />
                                            {/* Progress circle */}
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="50"
                                                className={`progress-fill ${
                                                    overallScore >= 85 ? 'excellent' :
                                                    overallScore >= 70 ? 'good' : 'poor'
                                                }`}
                                                style={{
                                                    '--progress': overallScore,
                                                    '--target-offset': 314.159 - (314.159 * overallScore / 100)
                                                }}
                                            />
                                        </svg>
                                        <Typography className="score-percentage-circular">
                                            {overallScore}%
                                        </Typography>
                                    </Box>
                                    <Typography className="score-status">
                                        {overallScore >= 85 ? 'Excellent Performance!' :
                                         overallScore >= 70 ? 'Good Performance!' :
                                         'Room for Improvement'}
                                    </Typography>
                                </Box>
                            </Card>

                            {/* Quick Stats */}
                            <div className="stats-grid">
                                <Card className="stat-card">
                                    <Box className="stat-emoji">⏱️</Box>
                                    <Typography className="stat-value">
                                        {totalAverageRecordedTime}
                                    </Typography>
                                    <Typography className="stat-label">
                                        Avg Time
                                    </Typography>
                                </Card>
                                <Card className="stat-card">
                                    <Box className="stat-emoji">📝</Box>
                                    <Typography className="stat-value">
                                        {Math.round(
                                            Object.values(questionData).reduce((sum, q) => sum + q.wordCount, 0) / totalQuestions
                                        )}
                                    </Typography>
                                    <Typography className="stat-label">
                                        Avg Words
                                    </Typography>
                                </Card>
                                <Card className="stat-card">
                                    <Box className="stat-emoji">🚫</Box>
                                    <Typography className="stat-value">
                                        {avgFillerWords}
                                    </Typography>
                                    <Typography className="stat-label">
                                        Avg Fillers
                                    </Typography>
                                </Card>
                                <Card className="stat-card">
                                    <Box className="stat-emoji">💪</Box>
                                    <Typography className="stat-value">
                                        {avgActionWords}
                                    </Typography>
                                    <Typography className="stat-label">
                                        Avg Actions
                                    </Typography>
                                </Card>
                            </div>
                        </div>

                        {/* Right Column - Key Takeaways */}
                        <div className="right-column">
                            <Card className="takeaways-card">
                                <Box className="takeaways-header">
                                    <Box className="takeaways-emoji">💡</Box>
                                    <Typography className="takeaways-title">
                                        Key Takeaways
                                    </Typography>
                                </Box>
                                <div className="takeaways-grid">
                                    {overallTips.map((tip, index) => (
                                        <Box className="takeaway-item" key={index}>
                                            <Box className="takeaway-dot" />
                                            <Typography className="takeaway-text">
                                                {tip}
                                            </Typography>
                                        </Box>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </motion.div>

                {/* Continue Button */}
                <motion.div
                    variants={itemVariants}
                    className="continue-button-container"
                >
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onViewDetails}
                        className="continue-button"
                    >
                        View Detailed Results
                        <ArrowForwardIcon className="continue-button-icon" />
                    </motion.button>
                </motion.div>
            </motion.div>
                </Box>
            </DefaultAppLayout>
        </Box>
    );
};

export default InterviewCompleteScreen;