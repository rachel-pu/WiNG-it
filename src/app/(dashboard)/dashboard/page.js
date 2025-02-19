"use client";
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { MdSpaceDashboard } from "react-icons/md";
import { HiDocumentText } from "react-icons/hi2";
import { IoSettings } from "react-icons/io5";
import {GiFluffyWing} from "react-icons/gi";
import { IoPersonCircle } from "react-icons/io5";
import LeftNavbar from '/components/LeftNavbar';
import Stack from "@mui/material/Stack";
import Grid from '@mui/material/Grid2';
import {FaMicrophone, FaPencilRuler} from "react-icons/fa";
import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';
import Link from 'next/link';
import CardMedia from '@mui/material/CardMedia';
import DashboardCard from './DashboardCard';
import {Button, CardActions} from "@mui/material";
import MainAppBar from "../../../../components/MainAppBar";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export default function Dashboard() {
    return (
        <SignedIn>
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* ----------- title header div w/ time & date ----------- */}
            <MainAppBar title="Dashboard" color="#324fd1" />

            {/* --------- sidebar navigation --------- */}
            <LeftNavbar />

            {/* --------- main content --------- */}
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: '#F3F1EB', p: 3, height: '100vh', overflow: 'auto' }}
            >
                <Toolbar />
            {/*  --------- grid ---------  */}
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 1, sm: 1, md: 2, lg: 3}}>

                        {/* behavioral interview simulator  */}
                        <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                            <DashboardCard
                                title="Behavioral Interview"
                                link={"/behavioral/instructions"}
                                description="This mode lets you practice behavioral interviews, customize your questions, and receive personalized improvement advice at the end."
                                image="static/images/testExample.png"
                                buttons={[
                                    { type: 'Simulation' },
                                    { type: 'Microphone' },
                                ]}
                            />
                        </Grid>

                    {/*  recruiter networking simulator  */}
                        <Grid size={{ xs: 1, sm: 1, md: 1 }}>
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
                        </Grid>

                    {/* webscraping tool */}
                        <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                            <DashboardCard
                                title="Webscraping Tool"
                                link={"/recruiter"}
                                description={"This mode lets you practice networking with recruiters, customize your questions, and receive personalized improvement advice at the end."}
                                image="static/images/testExample.png"
                                buttons={[
                                    { type: 'Tool'},
                                ]}
                            />
                        </Grid>

                    {/*  resume review tool  */}
                        <Grid size={{ xs: 1, sm: 1, md: 1 }}>
                            <DashboardCard
                                title="Webscraping Tool"
                                link={"/recruiter"}
                                description={"This mode lets you practice networking with recruiters, customize your questions, and receive personalized improvement advice at the end."}
                                image="static/images/testExample.png"
                                buttons={[
                                    { type: 'Tool'},
                                ]}
                            />
                        </Grid>

                    </Grid>
                </Box>
            </Box>
        </Box>
        </SignedIn>
    );
}