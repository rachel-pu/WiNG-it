"use client";
import Box from '@mui/material/Box';
import {Typography} from "@mui/material";
import { useNavigate } from 'react-router-dom';

export default function Footer() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                width: '100%',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
            }}
        >
            <Box sx={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <Typography component="span">
                    Copyright © 2025 WiNG.it
                </Typography>

                <Typography
                    component="span"
                    onClick={() => navigate('/terms', { state: { previousRoute: window.location.pathname }})}
                    sx={{ '&:hover': { color: 'white' }, cursor: 'pointer' }}
                >
                    Terms
                </Typography>

                <Typography
                    component="span"
                    onClick={() => navigate('/privacy', { state: { previousRoute: window.location.pathname }})}
                    sx={{ '&:hover': { color: 'white' }, cursor: 'pointer' }}
                >
                    Privacy Policy
                </Typography>

                <Typography
                    component="span"
                    onClick={() => window.location.href = "mailto:wingit.space@gmail.com"}
                    sx={{ '&:hover': { color: 'white' }, cursor: 'pointer' }}
                >
                    Contact Us
                </Typography>
            </Box>

            {/* reCAPTCHA attribution */}
            <Typography
                component="small"
                sx={{
                    display: 'block',
                    marginTop: '8px',
                    fontSize: '0.75rem',
                    color: '#dddadaff',
                    textAlign: 'center'
                }}
            >
                This site is protected by reCAPTCHA and the Google{' '}
                <a
                    href="https://policies.google.com/privacy"
                    style={{ color: '#b7c8f9ff' }}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                Privacy Policy
                </a>{' '}

                and{' '}
                <a
                    href="https://policies.google.com/terms"
                    style={{ color: '#b7c8f9ff' }}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                Terms of Service
                </a>{' '}
                apply.
            </Typography>
        </Box>
    );
}
