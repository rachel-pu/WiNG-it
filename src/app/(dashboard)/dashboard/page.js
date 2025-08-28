"use client";
import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid2';
import DashboardCard from '../dashboard/(components)/DashboardCard';

import DefaultAppLayout from "../../DefaultAppLayout";
import {  SignedIn } from '@clerk/nextjs'

import "./Dashboard.css";

export default function Dashboard() {
    return (
        <SignedIn>
            <Box sx={{ display: 'flex'}} bgcolor={
                            '#F3F1EA'
                        }>
                <CssBaseline />
                <DefaultAppLayout title="Dashboard" color="#2850d9">
                    {/* --------- main content --------- */}
                    <Box
                        component="main"
                        className="main-dashboard-container"
                    >
                    {/*  --------- grid ---------  */}
                        <Box sx={{ flexGrow: 1 }}>
                            {/* <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, sm: 1, md: 2, lg: 3}}> */}
                            <Grid container spacing={{ xs: 2, md: 3 }}  sx={{ maxWidth: "1200px", width: "100%" }} columns={{ xs: 1, sm: 1, md: 2, lg: 2}}>
                                {/* behavioral interview simulator  */}
                                 <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                                    <DashboardCard
                                        title="Behavioral Interview"
                                        link={"/behavioral"}
                                        description="This mode lets you practice behavioral interviews, customize your questions, and receive personalized improvement advice at the end."
                                        image="static/images/testExample.png"
                                        buttons={[
                                            { type: 'Simulation' },
                                            { type: 'Microphone' },
                                        ]}
                                    />
                                </Grid>
                                {/* <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                                    <DashboardCard
                                        title="Behavioral Interview"
                                        link={"/behavioral"}
                                        description="This mode lets you practice behavioral interviews, customize your questions, and receive personalized improvement advice at the end."
                                        image="static/images/testExample.png"
                                        buttons={[
                                            { type: 'Simulation' },
                                            { type: 'Microphone' },
                                        ]}
                                    />
                                </Grid> */}

                            {/*  recruiter networking simulator  */}
                                {/* <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                                    <DashboardCard
                                        title="Recruiter Networking"
                                        link={"/recruiter"}
                                        description={"This is an example description for the recruiter networking simulator. This is an example description for the recruiter networking simulator."}
                                        image="static/images/testExample.png"
                                        buttons={[
                                            { type: 'Simulation' },
                                            { type: 'Microphone' },
                                        ]}
                                    />
                                </Grid> */}

                            {/* webscraping tool */}
                                {/* <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                                    <DashboardCard
                                        title="Webscraping Tool"
                                        link={"/recruiter"}
                                        description={"This mode lets you practice networking with recruiters, customize your questions, and receive personalized improvement advice at the end."}
                                        image="static/images/testExample.png"
                                        buttons={[
                                            { type: 'Tool'},
                                        ]}
                                    />
                                </Grid> */}

                            {/*  resume review tool  */}
                                {/* <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                                    <DashboardCard
                                        title="Webscraping Tool"
                                        link={"/recruiter"}
                                        description={"This mode lets you practice networking with recruiters, customize your questions, and receive personalized improvement advice at the end."}
                                        image="static/images/testExample.png"
                                        buttons={[
                                            { type: 'Tool'},
                                        ]}
                                    />
                                </Grid> */}
                            </Grid>
                        </Box>
                    </Box>
                </DefaultAppLayout>
            </Box>
        </SignedIn>
    );
}