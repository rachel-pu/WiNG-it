"use client";
import Image from "next/image";
import Link from "next/link";
import CssBaseline from "@mui/material/CssBaseline";
import MainAppBar from "../../../../components/MainAppBar";
import LeftNavbar from "../../../../components/LeftNavbar";
import Toolbar from "@mui/material/Toolbar";
import React from "react";
import Box from "@mui/material/Box";
import { SignedIn } from "@clerk/nextjs";
import {Typography} from "@mui/material";

const Instructions = () => {
    return(
        <SignedIn>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />

                {/* ----------- title header div w/ user profile ----------- */}
                <MainAppBar title="Behavioral Interview Simulation" color="#6a39cb" />

                {/* --------- sidebar navigation --------- */}
                <LeftNavbar />

                {/* --------- left bar options --------- */}


                {/* --------- main content --------- */}
                <Box
                    component="main"
                    sx={{ flexGrow: 1, bgcolor: '#F3F1EB', p: 3, height: '100vh', overflow: 'auto' }}
                >
                    <Toolbar />

                    <Typography>
                        hello
                    </Typography>
                </Box>

            </Box>

        </SignedIn>
  );
}

export default Instructions;