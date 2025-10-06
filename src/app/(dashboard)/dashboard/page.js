// Replace your current dashboard page.js content with this:

"use client";
import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid2';
import DefaultAppLayout from "../../DefaultAppLayout";
import DashboardCard from '../dashboard/(components)/DashboardCard';

export default function Dashboard() {
    return (
        <Box>
            <DefaultAppLayout>
                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 4,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        minHeight: '100vh'
                    }}
                >
                    
                    {/* Tools Grid */}
                    <Grid 
                        container 
                        spacing={3} 
                        sx={{width: "100%" }}
                        columns={{ xs: 1, sm: 1, md: 2, lg: 3 }}
                    >
                        {/* Behavioral Interview - Active */}
                        <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                            <DashboardCard
                                title="Behavioral Interview"
                                link="/behavioral"
                                description="Practice behavioral interviews with AI-powered feedback. Customize your questions and receive personalized improvement advice."
                                status="active"
                                icon="🎯"
                                gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                buttons={[
                                    { type: 'Simulation' },
                                    { type: 'Microphone' },
                                ]}
                            />
                        </Grid>

                        {/* Smart Job Scraper */}
                        <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                            <DashboardCard
                                title="Smart Job Scraper"
                                link="#"
                                description="Automatically find and analyze job postings that match your skills. Extract key requirements and get preparation tips."
                                status="coming-soon"
                                icon="🔍"
                                gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                                buttons={[
                                    { type: 'Tool' },
                                ]}
                            />
                        </Grid>

                        {/* Resume Builder */}
                        <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                            <DashboardCard
                                title="AI Resume Builder"
                                link="#"
                                description="Create ATS-optimized resumes with AI assistance. Get suggestions for keywords and formatting tailored to your roles."
                                status="coming-soon"
                                icon="📄"
                                gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                                buttons={[
                                    { type: 'Tool' },
                                ]}
                            />
                        </Grid>

                    </Grid>
                </Box>
            </DefaultAppLayout>
        </Box>
    );
}