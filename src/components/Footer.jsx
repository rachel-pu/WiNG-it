"use client";
import Box from '@mui/material/Box';
import {Typography} from "@mui/material";
import { useNavigate } from 'react-router-dom';

export default function Footer({ position = 'absolute' , textColor= 'rgba(255, 255, 255, 0.7)'} ) {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                position: position,
                bottom: 20,
                left: 0,
                width: '100%',
                textAlign: 'center',
                color: textColor,
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
            }}
        >
            <Box sx={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <Typography component="span" style={{fontFamily: "Satoshi"}}>
                    Copyright © 2025 WiNG.it
                </Typography>

                <Typography
                    component="span"
                    onClick={() => navigate('/terms', { state: { previousRoute: window.location.pathname }})}
                    sx={{ '&:hover': { color: 'white' }, cursor: 'pointer' }}
                    style={{fontFamily: "Satoshi"}}
                >   
                    Terms
                </Typography>

                <Typography
                    component="span"
                    onClick={() => navigate('/privacy', { state: { previousRoute: window.location.pathname }})}
                    sx={{ '&:hover': { color: 'white' }, cursor: 'pointer' }}
                    style={{fontFamily: "Satoshi"}}
                >
                    Privacy Policy
                </Typography>
                
                <Typography
                    component="span"
                    onClick={() => navigate('/pricing', { state: { previousRoute: window.location.pathname }})}
                    sx={{ '&:hover': { color: 'white' }, cursor: 'pointer' }}
                    style={{fontFamily: "Satoshi"}}
                >
                    Pricing
                </Typography>

                <Typography
                    component="span"
                    onClick={() => window.location.href = "mailto:wingit.space@gmail.com"}
                    sx={{ '&:hover': { color: 'white' }, cursor: 'pointer' }}
                    style={{fontFamily: "Satoshi"}}
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
                    color: textColor,
                    textAlign: 'center', 
                }}
                style={{fontFamily: "Satoshi"}}
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
