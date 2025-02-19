"use client";
import Image from "next/image";
import Link from "next/link";
import CssBaseline from "@mui/material/CssBaseline";
import MainAppBar from "../../../../../components/MainAppBar";
import LeftNavbar from "../../../../../components/LeftNavbar";
import Toolbar from "@mui/material/Toolbar";
import React from "react";
import Box from "@mui/material/Box";
import { SignedIn } from "@clerk/nextjs";
import {Button, Typography} from "@mui/material";
import StepComponent from "../../StepComponent.jsx";
import { NumberField } from '@base-ui-components/react/number-field';
import { FaTools } from "react-icons/fa";
import {motion, inView, animate} from "framer-motion";


function CursorGrowIcon(props) {
    return (
        <svg
            width="26"
            height="14"
            viewBox="0 0 24 14"
            fill="black"
            stroke="white"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
        </svg>
    );
}
function PlusIcon(props) {
    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentcolor"
            strokeWidth="1.6"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M0 5H5M10 5H5M5 5V0M5 5V10" />
        </svg>
    );
}
function MinusIcon(props) {
    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentcolor"
            strokeWidth="1.6"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M0 5H10" />
        </svg>
    );
}

const Instructions = () => {
    const id = React.useId();

    const itemVariants = {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 },
        transition: { type: "spring"},
    };

    return(
        <SignedIn>
            <Box sx={{ display: 'flex', userSelect: 'none'}}>
                <CssBaseline />

                {/* ----------- title header div w/ user profile ----------- */}
                <MainAppBar title="Behavioral Interview Simulation" color="#2850d9" />

                {/* --------- sidebar navigation --------- */}
                <LeftNavbar />

                {/* --------- main content --------- */}
                <Box
                    component="main"
                    sx={{ flexGrow: 1, bgcolor: '#F3F1EB', p: 4.5, height: '100vh', overflow: 'auto'}}
                >
                    <Toolbar />

                    {/* title and description */}
                    <motion.div
                        initial="hidden"
                        whileInView='visible'
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        variants = {itemVariants}>

                    <Box>
                    <Typography color={"black"} fontFamily={"Satoshi-Bold"} fontSize={"1.7rem"} >
                        Quick Start Guide
                    </Typography>
                    <Typography color={"black"} fontFamily={"DM Sans"} fontSize={"1rem"}>
                        Practice behavioral interviews with this simulation. Choose 1–10 questions and receive personalized feedback.
                    </Typography>
                    </Box>
                    </motion.div>

                {/*  list of guide  */}
                    <motion.div
                        initial="hidden"
                        whileInView='visible'
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        variants = {itemVariants}>
                    <Box sx={{marginTop: '20px'}}>
                    {/*  component of image icon and title and small description  */}
                        <StepComponent
                            stepNumber={1}
                            stepTitle="This is a practice tool"
                            stepDescription="This is a simulation, and not a real representation of how you will do."
                        />
                        <StepComponent
                            stepNumber={2}
                            stepTitle="No skipping"
                            stepDescription="Like a real interview, you can't skip questions. Just answer each question to the best of your ability."
                        />
                        <StepComponent
                            stepNumber={3}
                            stepTitle="Caution leaving the simulation"
                            stepDescription="You can exit at any point of the simulator, but you will not get your results nor will your progress be saved."
                        />
                        <StepComponent
                            stepNumber={4}
                            stepTitle={"Clicking microphone"}
                            stepDescription={"Once you hit the microphone button, you cannot turn it off."}
                        />
                        <StepComponent
                            stepNumber={5}
                            stepTitle={"Make the most of it"}
                            stepDescription={"Treat this tool as a real interview to maximize its benefits!"}
                        />

                    </Box>
                    </motion.div>


                {/*  how many questions  */}
                    <motion.div
                        initial="hidden"
                        whileInView='visible'
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        variants = {itemVariants}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>

    {/* number counter */}
        <NumberField.Root
            id={id}
            defaultValue={5}
            min={1}
            max={10}
            className="flex flex-col items-start gap-1"
        >
            <NumberField.ScrubArea className="cursor-ew-resize">
                <label
                    htmlFor={id}
                    className="cursor-ew-resize text-sm text-gray-900 font-dm-sans-medium"
                >
                    Questions
                </label>
                <NumberField.ScrubAreaCursor className="drop-shadow-[0_1px_1px_#0008] filter">
                    <CursorGrowIcon />
                </NumberField.ScrubAreaCursor>
            </NumberField.ScrubArea>

                <NumberField.Group className="flex">
                    <NumberField.Decrement className="flex size-10 items-center justify-center rounded-tl-md rounded-bl-md border border-gray-200 bg-gray-50 bg-clip-padding text-gray-900 select-none hover:bg-gray-100 active:bg-gray-100">
                        <MinusIcon />
                    </NumberField.Decrement>
                    <NumberField.Input className="h-10 w-24 border-t border-b border-gray-200 text-center text-base text-gray-900 tabular-nums focus:z-1 focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 font-dm-sans-medium" />
                    <NumberField.Increment className="flex size-10 items-center justify-center rounded-tr-md rounded-br-md border border-gray-200 bg-gray-50 bg-clip-padding text-gray-900 select-none hover:bg-gray-100 active:bg-gray-100">
                        <PlusIcon />
                    </NumberField.Increment>
                </NumberField.Group>
            </NumberField.Root>
        </Box>
                    </motion.div>

                    {/* get started button */}
                    <motion.div
                        initial="hidden"
                        whileInView='visible'
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                        variants = {itemVariants}>
                    <Button color='inherit' href='/behavioral' sx={{fontSize: '2rem',margin: '0 auto', fontFamily: 'Satoshi Bold', textTransform: 'none', backgroundColor: '#2850d9',  borderRadius: '50px', color:  'white', letterSpacing: '-0.01px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05) rotate(-2deg)'}, boxShadow: 4, display: 'flex', alignItems: 'center', gap: 1, marginTop: '40px', width: '350px'}}>
                        Get Started
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7" />
                        </svg>
                    </Button>
                    </motion.div>
                </Box>


            </Box>

        </SignedIn>
  );
}

export default Instructions;