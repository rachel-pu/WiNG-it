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
import LeftNavbar from '/components/leftNavbar';
import Stack from "@mui/material/Stack";
import Grid from '@mui/material/Grid2';
import {FaMicrophone, FaPencilRuler} from "react-icons/fa";
import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';
import Link from 'next/link';
import CardMedia from '@mui/material/CardMedia';
import DashboardCard from '/components/DashboardCard';
import {Button, CardActions} from "@mui/material";

export default function Dashboard() {
    const drawerWidth = 240;

    // initializing variables
    const [currentDateTime, setCurrentDateTime] = useState({
        time: '',
        date: ''
    });

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString();
            setCurrentDateTime({ time, date });
        };

        // update date and time every second
        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);

        // cleanup
        return () => clearInterval(timer);
    }, []);

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* ----------- title header div w/ time & date ----------- */}
            <AppBar
                position="fixed"
                sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, bgcolor: '#324fd1', boxShadow: 'none'}}
            >
                <Toolbar>
                    <Box className = "flex flex-row w-full" sx={{justifyContent: 'space-between'}}>
                        {/* title */}
                        <Typography variant="h6" noWrap component="div" style={{marginTop: '8px', fontFamily: 'Satoshi Bold', fontSize: "1.5rem"}}>
                            Dashboard
                        </Typography>
                        {/* date/time */}
                        <Stack direction = {"column"}>
                            <Typography>
                                <span style={{ fontFamily: 'Satoshi Bold', fontSize: "1rem"}}> {currentDateTime.time}</span>
                            </Typography>
                            <Typography>
                                <span style={{ fontFamily: 'Satoshi Bold', fontSize: "1rem"}}> 01/11/2025</span>
                            </Typography>
                        </Stack>
                    </Box>
                </Toolbar>
            </AppBar>

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
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>

                        {/* interview simulator tool */}
                        {/*<Grid size={{ xs: 2, sm: 4, md: 4 }}>*/}
                            {/*<Link href={"/transcripts"}>*/}
                            {/*<Card*/}
                            {/*    sx={{*/}
                            {/*        borderRadius: '10px',*/}
                            {/*        transition: 'box-shadow 0.3s',*/}
                            {/*        '&:hover': { boxShadow: 6 },*/}
                            {/*        cursor: 'pointer',*/}
                            {/*        height: '400px'*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    <CardMedia*/}
                            {/*        sx={{ height: 200 }}*/}
                            {/*        image = "static/images/testExample.png"*/}
                            {/*    />*/}
                            {/*    <CardContent sx={{ padding: '5%' }}>*/}
                            {/*        <Typography sx={{*/}
                            {/*            fontFamily: 'DM Sans Bold',*/}
                            {/*            color: 'black',*/}
                            {/*            letterSpacing: '-0.5px',*/}
                            {/*            fontSize: '1.25rem',*/}
                            {/*            marginBottom: '5px'*/}
                            {/*        }}>*/}
                            {/*            Test*/}
                            {/*        </Typography>*/}
                            {/*        <Typography sx={{*/}
                            {/*            fontFamily: 'Satoshi Medium',*/}
                            {/*            color: '#696862',*/}
                            {/*            letterSpacing: '-0.5px',*/}
                            {/*            fontSize: '0.9rem'*/}
                            {/*        }}>*/}
                            {/*            Lorem ipsum odor amet, consectetuer adipiscing elit. Ultricies blandit montes orci, a fermentum fusce ipsum placerat.*/}
                            {/*        </Typography>*/}
                            {/*    </CardContent>*/}
                            {/*    <CardActions sx={{paddingX: '4%'}}>*/}
                            {/*        <Button size="small" variant="contained"*/}
                            {/*                startIcon = {<IoPersonCircle style={{ fontSize: '1rem' }} />}*/}
                            {/*                disableRipple*/}
                            {/*                disableElevation*/}
                            {/*                sx={{*/}
                            {/*            fontFamily: 'DM Sans Medium',*/}
                            {/*            backgroundColor: 'rgba(207,229,199,0.6)',*/}
                            {/*            color: '#657e58',*/}
                            {/*            borderThickness: 2,*/}
                            {/*            borderRadius: 1.5,*/}
                            {/*            letterSpacing: '-0.3px',*/}
                            {/*            fontSize: '0.8rem',*/}
                            {/*            textTransform: 'none',*/}
                            {/*            paddingX: 1.2}}>Simulation</Button>*/}
                            {/*        <Button size="small" variant="contained"*/}
                            {/*                startIcon = {<FaMicrophone style={{ fontSize: '0.9rem' }}/>}*/}
                            {/*                disableRipple*/}
                            {/*                disableElevation*/}
                            {/*                sx={{*/}
                            {/*                    fontFamily: 'DM Sans Medium',*/}
                            {/*                    backgroundColor: 'rgba(209,220,232,0.6)',*/}
                            {/*                    color: '#567b9f',*/}
                            {/*                    borderThickness: 2,*/}
                            {/*                    letterSpacing: '-0.3px',*/}
                            {/*                    borderRadius: 1.5,*/}
                            {/*                    textTransform: 'none',*/}
                            {/*                    fontSize: '0.8rem',*/}
                            {/*                    paddingX: 1.2}}>Microphone</Button>*/}
                            {/*    </CardActions>*/}
                            {/*</Card>*/}
                            {/*</Link>*/}
                        {/*</Grid>*/}

                        {/* behavioral interview simulator  */}
                        <Grid size={{ xs: 2, sm: 4, md: 4 }}>
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

                    {/*  recruiter networking simulator  */}
                        <Grid size={{ xs: 2, sm: 4, md: 4 }}>
                            <DashboardCard
                                title="Recruiter Networking"
                                link={"/recruiter"}
                                description={"This mode lets you practice networking with recruiters, customize your questions, and receive personalized improvement advice at the end."}
                                image="static/images/testExample.png"
                                buttons={[
                                    { type: 'Simulation' },
                                    { type: 'Microphone' },
                                ]}
                            />
                        </Grid>

                    {/* webscraping tool */}
                        <Grid size={{ xs: 2, sm: 4, md: 4 }}>
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



                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}