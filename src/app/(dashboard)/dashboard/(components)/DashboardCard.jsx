import React from 'react';
import { Card, CardContent, Typography, CardActions, Box, Chip } from '@mui/material';
import CardButtonTopic from "./CardButtonTopic";
import Link from 'next/link';
import { motion } from 'framer-motion';

const DashboardCard = ({ 
    title, 
    link, 
    description, 
    buttons = [], 
    status = 'active',
    icon = '🎯',
    gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}) => {
    const isComingSoon = status === 'coming-soon';
    
    const cardContent = (
        <motion.div
            whileHover={{ y: isComingSoon ? 0 : -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ height: '100%' }}
        >
            <Card
                sx={{
                    height: '420px',
                    borderRadius: '24px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease',
                    cursor: isComingSoon ? 'not-allowed' : 'pointer',
                    opacity: isComingSoon ? 0.8 : 1,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        boxShadow: isComingSoon ? 'none' : '0 25px 50px rgba(0, 0, 0, 0.15)',
                        transform: isComingSoon ? 'none' : 'translateY(-4px)',
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: gradient,
                        zIndex: 1
                    }
                }}
            >
                {/* Coming Soon Badge */}
                {isComingSoon && (
                    <Chip
                        label="Coming Soon"
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            zIndex: 2,
                            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                            color: '#1a202c',
                            fontFamily: 'DM Sans',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: '24px'
                        }}
                    />
                )}

                {/* Hero Section with Icon */}
                <Box
                    sx={{
                        height: '160px',
                        background: gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '40px',
                            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)'
                        }
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '4rem',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                            zIndex: 1
                        }}
                    >
                        {icon}
                    </Typography>
                </Box>

                <CardContent sx={{ 
                    p: '24px', 
                    pb: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100% - 160px)'
                }}>
                    {/* Status Indicator */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: isComingSoon ? '#ffd700' : '#4ade80',
                                mr: 1,
                                animation: isComingSoon ? 'none' : 'pulse 2s infinite'
                            }}
                        />
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                color: isComingSoon ? '#d97706' : '#16a34a',
                                fontFamily: 'DM Sans',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            {isComingSoon ? 'In Development' : 'Active'}
                        </Typography>
                    </Box>

                    {/* Title */}
                    <Typography 
                        sx={{
                            fontFamily: 'Satoshi Bold',
                            color: '#1a202c',
                            letterSpacing: '-0.5px',
                            fontSize: '1.4rem',
                            mb: 2,
                            lineHeight: 1.2
                        }}
                    >
                        {title}
                    </Typography>

                    {/* Description */}
                    <Typography 
                        sx={{
                            fontFamily: 'DM Sans',
                            color: '#64748b',
                            letterSpacing: '-0.2px',
                            fontSize: '0.95rem',
                            lineHeight: 1.5,
                            mb: 'auto'
                        }}
                    >
                        {description}
                    </Typography>

                    {/* Action Buttons */}
                    <CardActions sx={{ 
                        p: 0, 
                        mt: 2,
                        flexWrap: 'wrap',
                        gap: 1
                    }}>
                        {buttons.slice(0, 3).map((button, index) => (
                            <CardButtonTopic key={index} type={button.type} />
                        ))}
                    </CardActions>
                </CardContent>
            </Card>
        </motion.div>
    );

    // Add pulse animation styles
    const pulseStyles = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;

    return (
        <>
            <style>{pulseStyles}</style>
            {isComingSoon ? (
                <div onClick={(e) => {
                    e.preventDefault();
                    // Optional: Show a toast notification here
                    console.log('This feature is coming soon!');
                }}>
                    {cardContent}
                </div>
            ) : (
                <Link href={link} style={{ textDecoration: 'none' }}>
                    {cardContent}
                </Link>
            )}
        </>
    );
};

export default DashboardCard;