"use client";

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
import SavesButtons from "./SavesButtons";
import {SignedIn, UserButton} from '@clerk/nextjs'

export default function Saves() {
    const drawerWidth = 240;

    const items = [
        {
            type: 'interview',  // This could be 'interview', 'recruiter', 'resume', 'webscraping', etc.
            score: 7,           // Score is relevant for interview, recruiter, resume types
            title: 'Behavioral Interview',
            time: '3 hours ago',
            description: 'This is a description of the behavioral interview. This is a description of the behavioral interview. This is a description of the behavioral interview.'
        },
        {
            type: 'recruiter',
            score: 10,
            title: 'Recruiter Simulator',
            time: '3 hours ago',
            description: 'This is a description of the recruiter simulator. This is a description of the behavioral interview. This is a description of the behavioral interview.'
        },
        {
            type: 'webscraping',  // Note there's no score for webscraping, it will show an icon instead
            title: 'Webscraping Tool',
            time: '3 hours ago',
            description: 'Use this tool to scrape data from web pages. This is a description of the behavioral interview. This is a description of the behavioral interview.'
        }
    ];


    return(
        <SignedIn>
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* ----------- title header div w/ user profile ----------- */}
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
                        <UserButton appearance={{
                            variables : {
                                fontFamily: 'DM Sans',
                            }
                        }}/>
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

                {/*  --------- list of saves   ---------  */}
                <Box width = "34%" sx={{height: '100vh', marginRight: '2%'}}>
                    <List sx={{ flexGrow: 1 , }}>
                        <SavesButtons items={items} />
                </List>
                </Box>

                {/* vertical divider */}
                    <Divider orientation="vertical" variant="middle" flexItem />

                {/*  --------- screen of save list button ---------  */}
                <Box sx={{margin: '1%', width: '61%', height: '100vh', backgroundColor: 'blue'}}>
                    {/* header */}
                    <Box>
                    <Typography>

                    </Typography>
                    </Box>
                </Box>

                </Stack>
            </Box>
        </Box>
        </SignedIn>
    )
}
