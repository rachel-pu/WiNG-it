"use client"
// import InterviewQuestions from "../../../../components/InterviewQuestions";
import interviewService from '@/lib/interviewService';
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import Typography from "@mui/material/Typography";
import QuickstartPage from "@/app/(simulations)/behavioral/(components)/QuickstartPage";
import BehavioralSimulationPage from "@/app/(simulations)/behavioral/(components)/BehavioralSimulationPage";
import {CircularProgress} from "@mui/material";
import DefaultAppLayout from "../../DefaultAppLayout";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function BehavioralInterviewSimulation() {
    const [questions, setQuestions] = useState([]);
    const router = useRouter();
    const [jobRole, setJobRole] = useState("");
    const [numQuestions, setNumQuestions] = useState(5);
    const [questionTypes, setQuestionTypes] = useState([]);
    const [interviewerDifficulty, setInterviewerDifficulty] = useState("easy-going-personality");
    const [showQuickstart, setShowQuickstart] = useState(true);
    const [showTimer, setShowTimer] = useState(false);
    const firebaseConfig = {};
    const functions = getFunctions(undefined, "us-central1");
    const generateQuestionsFn = httpsCallable(functions, "generateQuestions");
    

    const fetchQuestions = async () => {
    try {
        const response = await fetch('https://us-central1-wing-it-e6a3a.cloudfunctions.net/generateQuestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            job_role: jobRole,
            numQuestions,
            questionTypes
        }),
        });

        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQuestions(data.questions);

    } catch (error) {
        console.error('Error generating questions:', error);
    }
    };

    const handleQuestionsChange = (event) => {
        setNumQuestions(event.target.value);
        console.log(event.target.value);
    }

    const handleJobRoleChange = (e) => {
        setJobRole(e.target.value);
    };

    // Handles the array of question types
    const handleQuestionTypesChange = (event) => {
        setQuestionTypes(event.target.value);
        console.log('Question types updated:', event.target.value);
    };

    const handleGetStarted = () => {
        setShowQuickstart(false);
        // getting backend questions
        fetchQuestions();
    }

    const handleTimerChange = (checked) => {
        setShowTimer(checked);
        console.log("Timer visibility set to:", checked);
    }

    // Handles interviewer difficulty changes
    const handleInterviewerDifficultyChange = (difficulty) => {
        setInterviewerDifficulty(difficulty);
        console.log("Interviewer difficulty set to:", difficulty);
    }

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <DefaultAppLayout title="Behavioral Interview Simulation" color="#2850d9">
                {/* --------- main content --------- */}
                {showQuickstart ? (
                    <QuickstartPage
                        jobRole={jobRole}
                        showTimer={showTimer}
                        numQuestions={numQuestions}
                        questionTypes={questionTypes}
                        interviewerDifficulty={interviewerDifficulty}
                        handleJobRoleChange={handleJobRoleChange}
                        handleQuestionsChange={handleQuestionsChange}
                        handleQuestionTypesChange={handleQuestionTypesChange}
                        handleGetStarted={handleGetStarted}
                        handleInterviewerDifficultyChange={handleInterviewerDifficultyChange}
                        handleTimerChange={handleTimerChange}
                    />
                ) : (
                    <Box
                        component="main"
                        sx={{ flexGrow: 1, bgcolor: "black", height: "100vh", overflow: "auto" }}
                    >
                        <Toolbar />
                        {/* question box component */}
                        <Box component="main" sx={{ height: "90vh", overflow: "auto", textAlign: "center"}}>
                            {questions && questions.length > 0 ? (
                                <BehavioralSimulationPage questions={questions} showTimer={showTimer}/>
                            ) : (
                                <Box sx={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: -200,
                                    bottom: 0,
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    backgroundColor: '#000000', // Black background
                                    zIndex: 1000
                                }}>
                                    {/* Loading content container */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        flexDirection: 'column', 
                                        gap: 3,
                                        textAlign: 'center'
                                    }}>
                                        <CircularProgress 
                                            size={60}
                                            sx={{ 
                                                color: '#F3F1EC'
                                            }} 
                                        />
                                        <Typography sx={{ 
                                            fontFamily: 'DM Sans', 
                                            color: '#F3F1EC',
                                            fontSize: '1.2rem',
                                            fontWeight: 500
                                        }}>
                                            Generating your simulation experience...
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}
            </DefaultAppLayout>  
        </Box>
    );
}