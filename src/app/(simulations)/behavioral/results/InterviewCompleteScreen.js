"use client";

import React from "react";
import { Box, Typography, Grid2 as Grid, LinearProgress, Card, CssBaseline, Toolbar } from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DefaultAppLayout from "../../../DefaultAppLayout";

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
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <DefaultAppLayout elevation={16} title="Interview Results" color="#2850d9" titlecolor="#FFFFFF">
                <Box sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 2, md: 3 },
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Toolbar sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }} />
            {/* Decorative Background Elements */}
            <Box sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                zIndex: 1
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: -50,
                left: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                zIndex: 1
            }} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                style={{ width: '100%', maxWidth: '800px', position: 'relative', zIndex: 2 }}
            >
                {/* Main Celebration Section */}
                <motion.div variants={itemVariants}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{
                            fontSize: { xs: '3rem', md: '4rem' },
                            mb: 1,
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                        }}>
                            🎉
                        </Box>
                        <Typography sx={{
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            fontWeight: 800,
                            color: 'white',
                            mb: 1,
                            fontFamily: 'Satoshi Black',
                            textAlign: 'center',
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}>
                            Interview Complete!
                        </Typography>
                        <Typography sx={{
                            fontSize: { xs: '1rem', md: '1.2rem' },
                            color: 'rgba(255,255,255,0.9)',
                            fontFamily: 'DM Sans',
                            fontWeight: 500,
                            textAlign: 'center'
                        }}>
                            You answered {totalQuestions} behavioral interview questions
                        </Typography>
                    </Box>
                </motion.div>

                {/* Score Display */}
                <motion.div variants={itemVariants}>
                    <Card sx={{
                        p: 3,
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                        mb: 3,
                        textAlign: 'center'
                    }}>
                        <Typography sx={{
                            fontSize: '1rem',
                            color: '#6b7280',
                            mb: 2,
                            fontFamily: 'DM Sans Medium',
                            fontWeight: 600
                        }}>
                            Your Overall Performance
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
                            <Typography sx={{
                                fontSize: { xs: '3rem', md: '3.5rem' },
                                fontWeight: 900,
                                color: '#1f2937',
                                fontFamily: 'Satoshi Black',
                                lineHeight: 1
                            }}>
                                {overallScore}%
                            </Typography>
                            <Box sx={{ flex: 1, maxWidth: 250 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={overallScore}
                                    sx={{
                                        height: 12,
                                        borderRadius: 6,
                                        backgroundColor: '#e5e7eb',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: overallScore >= 85 ? '#10b981' :
                                                           overallScore >= 70 ? '#f59e0b' : '#ef4444',
                                            borderRadius: 6
                                        }
                                    }}
                                />
                                <Typography sx={{
                                    fontSize: '0.9rem',
                                    color: '#6b7280',
                                    mt: 0.5,
                                    fontFamily: 'DM Sans',
                                    fontWeight: 500
                                }}>
                                    {overallScore >= 85 ? 'Excellent Performance!' :
                                     overallScore >= 70 ? 'Good Performance!' :
                                     'Room for Improvement'}
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div variants={itemVariants}>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid xs={6} sm={3}>
                            <Card sx={{
                                p: 2,
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                textAlign: 'center',
                                height: '100%'
                            }}>
                                <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>⏱️</Box>
                                <Typography sx={{
                                    fontSize: '1.4rem',
                                    fontWeight: 700,
                                    color: '#1f2937',
                                    fontFamily: 'Satoshi Bold',
                                    lineHeight: 1
                                }}>
                                    {totalAverageRecordedTime}
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.8rem',
                                    color: '#6b7280',
                                    fontFamily: 'DM Sans',
                                    fontWeight: 500
                                }}>
                                    Avg Time
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid xs={6} sm={3}>
                            <Card sx={{
                                p: 2,
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                textAlign: 'center',
                                height: '100%'
                            }}>
                                <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>📝</Box>
                                <Typography sx={{
                                    fontSize: '1.4rem',
                                    fontWeight: 700,
                                    color: '#1f2937',
                                    fontFamily: 'Satoshi Bold',
                                    lineHeight: 1
                                }}>
                                    {Math.round(
                                        Object.values(questionData).reduce((sum, q) => sum + q.wordCount, 0) / totalQuestions
                                    )}
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.8rem',
                                    color: '#6b7280',
                                    fontFamily: 'DM Sans',
                                    fontWeight: 500
                                }}>
                                    Avg Words
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid xs={6} sm={3}>
                            <Card sx={{
                                p: 2,
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                textAlign: 'center',
                                height: '100%'
                            }}>
                                <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>🚫</Box>
                                <Typography sx={{
                                    fontSize: '1.4rem',
                                    fontWeight: 700,
                                    color: '#1f2937',
                                    fontFamily: 'Satoshi Bold',
                                    lineHeight: 1
                                }}>
                                    {avgFillerWords}
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.8rem',
                                    color: '#6b7280',
                                    fontFamily: 'DM Sans',
                                    fontWeight: 500
                                }}>
                                    Avg Fillers
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid xs={6} sm={3}>
                            <Card sx={{
                                p: 2,
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                textAlign: 'center',
                                height: '100%'
                            }}>
                                <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>💪</Box>
                                <Typography sx={{
                                    fontSize: '1.4rem',
                                    fontWeight: 700,
                                    color: '#1f2937',
                                    fontFamily: 'Satoshi Bold',
                                    lineHeight: 1
                                }}>
                                    {avgActionWords}
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.8rem',
                                    color: '#6b7280',
                                    fontFamily: 'DM Sans',
                                    fontWeight: 500
                                }}>
                                    Avg Actions
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </motion.div>

                {/* Key Takeaways */}
                <motion.div variants={itemVariants}>
                    <Card sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                        mb: 3
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box sx={{ fontSize: '1.5rem' }}>💡</Box>
                            <Typography sx={{
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                color: '#1f2937',
                                fontFamily: 'Satoshi Bold'
                            }}>
                                Key Takeaways
                            </Typography>
                        </Box>
                        <Grid container spacing={1.5}>
                            {overallTips.map((tip, index) => (
                                <Grid xs={12} md={4} key={index}>
                                    <Box sx={{
                                        p: 2,
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5
                                    }}>
                                        <Box sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            backgroundColor: '#3b82f6',
                                            flexShrink: 0
                                        }} />
                                        <Typography sx={{
                                            fontSize: '0.85rem',
                                            color: '#374151',
                                            lineHeight: 1.3,
                                            fontWeight: 500,
                                            fontFamily: 'DM Sans'
                                        }}>
                                            {tip}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Card>
                </motion.div>

                {/* Continue Button */}
                <motion.div
                    variants={itemVariants}
                    style={{ textAlign: 'center' }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onViewDetails}
                        style={{
                            padding: '16px 32px',
                            borderRadius: '50px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            fontFamily: 'Satoshi Bold',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            color: '#1f2937',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            margin: '0 auto'
                        }}
                    >
                        View Detailed Results
                        <ArrowForwardIcon sx={{ fontSize: '1.2rem' }} />
                    </motion.button>
                </motion.div>
            </motion.div>
                </Box>
            </DefaultAppLayout>
        </Box>
    );
};

export default InterviewCompleteScreen;