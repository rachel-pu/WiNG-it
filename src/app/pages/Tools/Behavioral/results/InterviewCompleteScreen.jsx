"use client";
import { useState, useEffect } from "react";
import { Box, Typography, Grid as Card } from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Confetti from 'react-confetti';
import DefaultAppLayout from "../../../../DefaultAppLayout.jsx";
import "./InterviewCompleteScreen.css";
import { useLocation } from "react-router-dom";
import BadgeNotification from "../../../../../components/BadgesNotif.jsx";

const InterviewCompleteScreen = ({
    overallScore,
    totalQuestions,
    totalAverageRecordedTime,
    questionData,
    overallTips,
    onViewDetails
}) => {
    // Confetti state
    const [windowDimensions, setWindowDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800
    });
    const [showConfetti, setShowConfetti] = useState(true);
    const location = useLocation();
    const newBadges = location.state?.newBadges || [];
    const [showBadgeNotification, setShowBadgeNotification] = useState(true);

    useEffect(() => {
        if (newBadges.length > 0) {
            setShowBadgeNotification(true);
        }
    }, [newBadges]); 


    // Get window dimensions for confetti
    useEffect(() => {
        const updateWindowDimensions = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        updateWindowDimensions();
        window.addEventListener('resize', updateWindowDimensions);

        // Stop confetti after 5 seconds
        const timer = setTimeout(() => {
            setShowConfetti(false);
        }, 5000);


        return () => {
            window.removeEventListener('resize', updateWindowDimensions);
            clearTimeout(timer);
        };
    }, []);

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
        <>
            {showConfetti && (
                <Confetti
                    width={windowDimensions.width}
                    height={windowDimensions.height}
                    numberOfPieces={500}
                    recycle={false}
                    gravity={0.3}
                    initialVelocityY={40}
                    colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce']}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 9999,
                        pointerEvents: 'none'
                    }}
                />
            )}
            <Box>
                <DefaultAppLayout>
                <Box className="InterviewCompleteScreen-interview-complete-container">
            {/* Decorative Background Elements */}
            <Box className="InterviewCompleteScreen-decorative-circle-top" />
            <Box className="InterviewCompleteScreen-decorative-circle-bottom" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="InterviewCompleteScreen-interview-complete-content"
            >
                {/* Main Celebration Section */}
                <motion.div variants={itemVariants}>
                    <Box className="InterviewCompleteScreen-celebration-section">
                        <Typography className="InterviewCompleteScreen-celebration-title">
                            Interview Complete! 🎉
                        </Typography>
                        <Typography className="InterviewCompleteScreen-celebration-subtitle">
                            You answered {totalQuestions} behavioral interview questions
                        </Typography>
                    </Box>
                </motion.div>

                {/* Two Column Layout */}
                <motion.div variants={itemVariants}>
                    <div className="InterviewCompleteScreen-two-column-layout">
                        {/* Left Column - Performance and Stats */}
                        <div className="InterviewCompleteScreen-left-column">
                            {/* Score Display */}
                            <Card className="InterviewCompleteScreen-score-card">
                                <Typography className="InterviewCompleteScreen-score-label">
                                    Your Overall Performance
                                </Typography>

                                <Box className="InterviewCompleteScreen-score-display">
                                    <Box className="InterviewCompleteScreen-circular-progress-container">
                                        <svg className="InterviewCompleteScreen-circular-progress" viewBox="0 0 120 120">
                                            {/* Background circle */}
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="50"
                                                className="InterviewCompleteScreen-progress-bg"
                                            />
                                            {/* Progress circle */}
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="50"
                                                className={`InterviewCompleteScreen-progress-fill ${
                                                    overallScore >= 85 ? 'InterviewCompleteScreen-excellent' :
                                                    overallScore >= 70 ? 'InterviewCompleteScreen-good' : 'InterviewCompleteScreen-poor'
                                                }`}
                                                style={{
                                                    '--progress': overallScore,
                                                    '--target-offset': 314.159 - (314.159 * overallScore / 100)
                                                }}
                                            />
                                        </svg>
                                        <Typography className="InterviewCompleteScreen-score-percentage-circular">
                                            {overallScore}%
                                        </Typography>
                                    </Box>
                                    <Typography className="InterviewCompleteScreen-score-status">
                                        {overallScore >= 85 ? 'Excellent Performance!' :
                                         overallScore >= 70 ? 'Good Performance!' :
                                         'Room for Improvement'}
                                    </Typography>
                                </Box>
                            </Card>

                            {/* Quick Stats */}
                            <div className="InterviewCompleteScreen-stats-grid">
                                <Card className="InterviewCompleteScreen-stat-card">
                                    <Box className="InterviewCompleteScreen-stat-emoji">⏱️</Box>
                                    <Typography className="InterviewCompleteScreen-stat-value">
                                        {totalAverageRecordedTime}
                                    </Typography>
                                    <Typography className="InterviewCompleteScreen-stat-label-results">
                                        Avg Time
                                    </Typography>
                                </Card>
                                <Card className="InterviewCompleteScreen-stat-card">
                                    <Box className="InterviewCompleteScreen-stat-emoji">📝</Box>
                                    <Typography className="InterviewCompleteScreen-stat-value">
                                        {Math.round(
                                            Object.values(questionData).reduce((sum, q) => sum + q.wordCount, 0) / totalQuestions
                                        )}
                                    </Typography>
                                    <Typography className="InterviewCompleteScreen-stat-label-results">
                                        Avg Words
                                    </Typography>
                                </Card>
                                <Card className="InterviewCompleteScreen-stat-card">
                                    <Box className="InterviewCompleteScreen-stat-emoji">🚫</Box>
                                    <Typography className="InterviewCompleteScreen-stat-value">
                                        {avgFillerWords}
                                    </Typography>
                                    <Typography className="InterviewCompleteScreen-stat-label-results">
                                        Avg Fillers
                                    </Typography>
                                </Card>
                                <Card className="InterviewCompleteScreen-stat-card">
                                    <Box className="InterviewCompleteScreen-stat-emoji">💪</Box>
                                    <Typography className="InterviewCompleteScreen-stat-value">
                                        {avgActionWords}
                                    </Typography>
                                    <Typography className="InterviewCompleteScreen-stat-label-results">
                                        Avg Actions
                                    </Typography>
                                </Card>
                            </div>
                        </div>

                        {/* Right Column - Key Takeaways */}
                        <div className="InterviewCompleteScreen-right-column">
                            <Card className="InterviewCompleteScreen-takeaways-card">
                                <Box className="InterviewCompleteScreen-takeaways-header">
                                    <Box className="InterviewCompleteScreen-takeaways-emoji">💡</Box>
                                    <Typography className="InterviewCompleteScreen-takeaways-title">
                                        Key Takeaways
                                    </Typography>
                                </Box>
                                <div className="InterviewCompleteScreen-takeaways-grid">
                                    {overallTips.map((tip, index) => (
                                        <Box className="InterviewCompleteScreen-takeaway-item" key={index}>
                                            <Box className="InterviewCompleteScreen-takeaway-dot" />
                                            <Typography className="InterviewCompleteScreen-takeaway-text">
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
                    className="InterviewCompleteScreen-continue-button-container"
                >
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onViewDetails}
                        className="InterviewCompleteScreen-continue-button"
                    >
                        View Detailed Results
                        <ArrowForwardIcon className="InterviewCompleteScreen-continue-button-icon" />
                    </motion.button>
                </motion.div>
            </motion.div>
                </Box>
            </DefaultAppLayout>

            {showBadgeNotification && newBadges.length > 0 && (
                <BadgeNotification
                    badges={newBadges}
                    onClose={() => setShowBadgeNotification(false)}
                />
            )}

            </Box>
        </>
    );
};

export default InterviewCompleteScreen;