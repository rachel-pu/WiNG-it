"use client";
import Toolbar from "@mui/material/Toolbar";
import React, {useRef, useState, useEffect} from "react";
import Box from "@mui/material/Box";
import {SignedIn} from "@clerk/nextjs";
import {Autocomplete, Button, FormControlLabel, FormLabel, Radio, RadioGroup, Switch, Typography} from "@mui/material";
import InstructionsStepComponent from "../../(components)/InstructionsStepComponent.jsx";
import {motion} from "framer-motion";
import TextField from "@mui/material/TextField";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import VideocamIcon from '@mui/icons-material/Videocam';
import {useRouter} from "next/navigation";


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
            <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z"/>
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
            <path d="M0 5H5M10 5H5M5 5V0M5 5V10"/>
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
            <path d="M0 5H10"/>
        </svg>
    );
}

const QuickstartPage = ({
                            jobRole,
                            numQuestions,
                            questionTypes,
                            interviewerDifficulty,
                            handleQuestionsChange,
                            handleJobRoleChange,
                            handleQuestionTypesChange,
                            handleGetStarted,
                            handleInterviewerDifficultyChange,
                            handleTimerChange,

                        }) => {

    const id = React.useId();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const itemVariants = {
        hidden: {opacity: 0, y: 5},
        visible: {opacity: 1, y: 0},
        transition: {type: "spring"},
    };

    // Removed all microphone-related state and functions

    const theme = createTheme({
        typography: {
            fontFamily: 'DM Sans, sans-serif',
        },
    });
    return (
        <SignedIn>

            {/* --------- main content --------- */}
            <Box
                component="main"
                sx={{flexGrow: 1, bgcolor: '#F3F1EB', p: 4.5, height: '100vh', overflow: 'auto'}}
            >
                <Toolbar/>


                {/* title and description */}
                <motion.div
                    initial="hidden"
                    whileInView='visible'
                    viewport={{once: true}}
                    transition={{delay: 0.2}}
                    variants={itemVariants}>

                    <Box>
                        <Typography color={"black"} fontFamily={"Satoshi Bold"} fontSize={"1.7rem"}>
                            Quick Start Guide
                        </Typography>
                        <Typography color={"black"} fontFamily={"DM Sans"} fontSize={"1rem"}>
                            Practice behavioral interviews with this simulation.
                            Choose from answering 1–5 questions, type in the role you want to practice for, and receive
                            personalized feedback.
                            Have fun practicing!
                        </Typography>
                    </Box>
                </motion.div>

                {/*  div box of both instructions + options to choose  */}
                <motion.div
                    initial="hidden"
                    whileInView='visible'
                    style={{display: 'flex', flexDirection: 'row', gap: '2.5%'}}
                    viewport={{once: true}}
                    transition={{delay: 0.4}}
                    variants={itemVariants}>

                    {/*  instructions box  */}
                    <Box sx={{
                        marginTop: '20px',
                        backgroundColor: '#d9d7d0',
                        padding: '30px',
                        borderRadius: '20px',
                        boxShadow: 4,
                        width: '50%'
                    }}>
                        {
                            /*  step components  */}
                        <InstructionsStepComponent
                            stepNumber={1}
                            stepTitle="This is a practice tool"
                            stepDescription="This is a simulation and not a real representation of how you will do during a real interview!"
                        />
                        <InstructionsStepComponent
                            stepNumber={2}
                            stepTitle="No skipping"
                            stepDescription="Like a real interview, you can't skip questions."
                        />
                        <InstructionsStepComponent
                            stepNumber={3}
                            stepTitle="Caution leaving the simulation"
                            stepDescription="Exiting will result in loss of progress and results."
                        />
                        <InstructionsStepComponent
                            stepNumber={4}
                            stepTitle={"Voice recording required"}
                            stepDescription={"This simulation requires microphone access for voice recording during the interview."}
                        />
                        <InstructionsStepComponent
                            stepNumber={5}
                            stepTitle={"Make the most of it"}
                            stepDescription={"Treat this tool as a real interview to maximize its benefits!"}
                        />

                    </Box>

                    {/*  options box  */}
                    <ThemeProvider theme={theme}>
                        <Box sx={{
                            marginTop: '20px',
                            backgroundColor: '#d9d7d0',
                            padding: '30px',
                            borderRadius: '20px',
                            boxShadow: 4,
                            width: '50%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <FormLabel
                                sx={{
                                    color: '#000',
                                    '&.Mui-focused': {
                                        color: '#000',
                                    },
                                }}
                            >Interview Customizations</FormLabel>

                            {/*  where the main options can be picked for user  */}
                            <Box flex={1} display={'flex'} flexDirection={'column'} gap={'4%'}>
                                {/* description */}
                                <Typography color={"#91908C"} fontSize={"0.9rem"}>
                                    Customize your interview experience by filling out the following fields. Leaving the
                                    fields blank will give you a general experience.
                                </Typography>

                                {/*  typing in role + num questions */}
                                <Box flexDirection={'horizontal'} display={'flex'} justifyContent={'space-between'}
                                     gap={'2.5%'}>
                                    {/* job role text input */}
                                    <TextField id="outlined-basic" value={jobRole} onChange={handleJobRoleChange}
                                               fullWidth label="Enter Job Role" placeholder="e.g. Software Engineer"
                                               variant="outlined" InputLabelProps={{style: {fontFamily: 'DM Sans'}}}
                                               InputProps={{style: {fontFamily: 'DM Sans'}}}/>

                                    {/* number of questions */}
                                    <FormControl sx={{width: '48%'}}>
                                        <InputLabel id="demo-simple-select-label">Number of Questions</InputLabel>
                                        <Select
                                            value={numQuestions}
                                            label="Number of Questions"
                                            onChange={handleQuestionsChange}>
                                            <MenuItem value={1}>1</MenuItem>
                                            <MenuItem value={2}>2</MenuItem>
                                            <MenuItem value={3}>3</MenuItem>
                                            <MenuItem value={4}>4</MenuItem>
                                            <MenuItem value={5}>5</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* multiple input autocomplete for question types */}

                                <Autocomplete
                                    multiple
                                    fullWidth
                                    id="tags-outlined"
                                    options={['Situational', 'Problem-solving', 'Technical', 'Leadership', 'Teamwork']}
                                    getOptionLabel={(option) => option}
                                    onChange={handleQuestionTypesChange}
                                    filterSelectedOptions
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Types of Behavioral Questions"
                                            placeholder={params.InputProps.startAdornment ? '' : 'Select question types to practice'}
                                        />
                                    )}
                                />

                                {/*  difficulty  */}
                                <Box fullwidth display={'flex'} justifyContent={'space-between'} gap={'2.5%'}>
                                    {/* difficulty */}
                                    <FormControl>
                                        <FormLabel
                                            sx={{
                                                color: '#000',
                                                '&.Mui-focused': {
                                                    color: '#000',
                                                },
                                            }}
                                        >Interviewer Difficulty</FormLabel>
                                        <Typography fontSize={"0.9rem"} color={'#91908C'}>
                                            Choose a difficulty level to match the style you want to
                                            practice. </Typography>
                                        <RadioGroup
                                            row
                                            value={interviewerDifficulty}
                                            onChange={e => handleInterviewerDifficultyChange(e.target.value)}
                                            name="row-radio-buttons-group"
                                        >
                                            <FormControlLabel value="easy-going-personality" control={<Radio/>}
                                                              label="Easy-going"/>
                                            <FormControlLabel value="professional-personality" control={<Radio/>}
                                                              label="Professional"/>
                                            <FormControlLabel value="intense-personality" control={<Radio/>}
                                                              label="Intense"/>
                                            <FormControlLabel value="randomize-personality" control={<Radio/>}
                                                              label="Randomize"/>
                                        </RadioGroup>
                                    </FormControl>

                                </Box>

                                {/* timer */}
                                <Box>
                                    <FormControl>
                                        <FormLabel sx={{
                                            color: '#000',
                                            '&.Mui-focused': {
                                                color: '#000',
                                            },
                                        }}
                                        >
                                            Other options
                                        </FormLabel>
                                        <FormControlLabel control={<Switch/>} label="2-minute timer"/>
                                    </FormControl>
                                </Box>
                            </Box>

                            {/* Removed the microphone toggle section */}

                        </Box>

                    </ThemeProvider>
                </motion.div>


                {/* get started button */}
                <motion.div
                    initial="hidden"
                    whileInView='visible'
                    viewport={{once: true}}
                    transition={{delay: 0.8}}
                    variants={itemVariants}>

                    <Button color='inherit' onClick={handleGetStarted} sx={{
                        fontSize: '2rem',
                        margin: '0 auto',
                        fontFamily: 'Satoshi Bold',
                        textTransform: 'none',
                        backgroundColor: '#2850d9',
                        borderRadius: '50px',
                        color: 'white',
                        letterSpacing: '-0.01px',
                        transition: 'transform 0.3s',
                        '&:hover': {transform: 'scale(1.05) rotate(-2deg)'},
                        boxShadow: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        marginTop: '45px',
                        width: '350px'
                    }}>
                        Get Started!
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7"/>
                        </svg>
                    </Button>
                </motion.div>
            </Box>
        </SignedIn>
    );
}

export default QuickstartPage;