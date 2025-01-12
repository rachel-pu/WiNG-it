"use client";
// import Link from "next/link";
// import Image from "next/image";
// import LeftNavbar from '/components/leftNavbar';
//
//
// const Transcripts = () => {
//     return (
//         <div className="flex h-screen w-full">
//
//             {/*/!* --------------------- vertical navbar --------------------- *!/*/}
//             <LeftNavbar/>
//
//             {/* --------------------- main background ---------------------*/}
//             <div
//                 sx={{ flexGrow: 1, bgcolor: '#F3F1EB', p: 3, height: '100vh', overflow: 'auto' }}
//             >
//                 {/* --------------------- first column --------------------- */}
//                 <div className="grid grid-rows-2 max-w-6xl items-center justify-between w-full pt-1/50 pr-1/25 pl-1/25">
//                     {/* title */}
//                     <h1 className="text-7xl font-dm-sans-black text-color282523 tracking-tighter">
//                         Transcripts
//                     </h1>
//                     <p className="text-2xl font-dm-sans text-color282523 tracking-tighter">
//                         Here, you can review your saved responses from the behavioral interview and recruiter
//                         simulators. Remember practice makes perfect! :)
//                     </p>
//
//                 </div>
//
//                 {/* --------------------- grid of options --------------------- */}
//                 <div className="grid grid-rows-2 gap-10 px-10 w-full max-w-6xl">
//
//                     {/* behavioral interview  */}
//                     <div
//                         className="relative bg-gradient-to-b from-color6998C2 to-color3163C7 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between">
//                         <h2 className="mb-3 leading-10 text-4xl font-semibold text-colorF3F1EA font-dm-sans-black tracking-tighter">
//                             Behavioral Interview Simulator Responses</h2>
//                         <p className="text-colorF3F1EA font-sat oshi leading-tight text-2.5xl">
//                             Your average score: </p>
//
//                         {/*-----------------button--------------------*/}
//                         <div className="absolute bottom-6 right-6 group">
//                             <Link href='saves/behavioral-interview-saves'
//                                   className="bg-gradient-to-r from-[#C8E2AF] to-[#6CBE20] text-2xl font-dm-sans tracking-tight text-color282523 py-2 px-8 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-102 group-hover:-rotate-1">
//                                 <span className="font-dm-sans-black">See Responses</span>
//                                 <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3"
//                                      viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7"/>
//                                 </svg>
//                             </Link>
//                         </div>
//
//
//                     </div>
//
//                     {/* instructions practice*/}
//                     <div
//                         className="relative bg-gradient-to-b from-color6998C2 to-color8BCA67 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between">
//                         <h2 className=" leading-10 text-4xl font-semibold text-colorF3F1EA font-dm-sans-black tracking-tighter">
//                             Recruiter Simulator Responses</h2>
//                         <p className="text-colorF3F1EA font-satoshi leading-tight text-2.5xl">
//                             Your average score: </p>
//
//                         {/*-----------------button--------------------*/}
//                         <div className="absolute bottom-6 right-6 group">
//                             <Link href='./recruiter-responses'
//                                   className="bg-gradient-to-r from-[#C8E2AF] to-[#6CBE20] text-2xl font-dm-sans tracking-tight text-color282523 py-2 px-8 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-102 group-hover:-rotate-1">
//                                 <span className="font-dm-sans-black">See Responses</span>
//                                 <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3"
//                                      viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7"/>
//                                 </svg>
//                             </Link>
//                         </div>
//
//
//                     </div>
//
//                     {/*/!* webscraper (need better name) *!/*/}
//                     {/*<div className="bg-gradient-to-b from-color6998C2 to-color3163C7 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between hover:scale-105 transition-transform duration-300 transform hover:cursor-pointer">*/}
//                     {/*    <h2 className="mb-3 leading-10 text-4xl font-semibold text-colorF3F1EA font-dm-sans-black tracking-tighter">*/}
//                     {/*        Webscraper</h2>*/}
//                     {/*    <p className = "text-colorF3F1EA font-satoshi leading-tight">*/}
//                     {/*        This mode allows you to practice getting comfortable talking to recruiters during job conferences.</p>*/}
//                     {/*</div>*/}
//
//                     {/* to be continued */}
//                     {/*<div*/}
//                     {/*    className="bg-gradient-to-b from-color6998C2 to-color3163C7 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between hover:scale-105 transition-transform duration-300 transform hover:cursor-pointer">*/}
//
//                     {/*</div>*/}
//                 </div>
//             </div>
//         </div>
//     )
//
// }
//
// export default Transcripts;

import Link from "next/link";
import Image from "next/image";
import LeftNavbar from '/components/LeftNavbar';
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import React, {useEffect, useState} from "react";
import {GiFluffyWing} from "react-icons/gi";
import {Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import {MdSpaceDashboard} from "react-icons/md";
import {HiDocumentText} from "react-icons/hi";
import {IoSettings} from "react-icons/io5";
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

export default function Saves() {
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

    return(
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* ----------- title header div w/ time & date ----------- */}
            <AppBar
                position="fixed"
                sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, bgcolor: '#6a39cb', boxShadow: 'none'}}
            >
                <Toolbar>
                    <Box className = "flex flex-row w-full" sx={{justifyContent: 'space-between'}}>
                        {/* title */}
                        <Typography variant="h6" noWrap component="div" style={{marginTop: '8px', fontFamily: 'Satoshi Bold', fontSize: "1.5rem"}}>
                            Saves
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

            {/* --------- left bar options --------- */}


            {/* --------- main content --------- */}
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: '#F3F1EB', p: 3, height: '100vh', overflow: 'auto' }}
            >
                <Toolbar />

                {/* --------- horizontal layout for list and responses --------- */}
                <Stack direction={"row"}>

                {/*  --------- list of items   ---------  */}
                <Box width = "28%" sx={{height: '100vh', marginRight: '2%'}}>
                    <List sx={{ flexGrow: 1 }}>

                        <ListItemButton sx={{borderRadius: 2, backgroundColor: '#e0dedb', borderColor: '#cccbc7', borderWidth: 1,
                            borderStyle: 'solid'}} component="a" href="/dashboard">
                            <Stack direction={'column'} sx={{width:"100%"}}>
                                {/* title and time when the assignment was done*/}
                                <Box className="flex flex-row" sx={{ justifyContent: 'space-between'}}>
                                    <Typography color='black'>
                                        Behavioral Interview
                                    </Typography>
                                    <Typography color='#9A9A95FF' sx={{fontSize: '0.85rem'}}>3 hours ago</Typography>
                                </Box>

                            </Stack>
                        </ListItemButton>

                </List>
                </Box>

                {/* vertical divider */}
                    <Divider orientation="vertical" variant="middle" flexItem />

                <Box>
                    <Typography sx={{backgroundColor: 'red'}}>
                        bello
                    </Typography>
                </Box>

                </Stack>
            </Box>
        </Box>
    )
}
