"use client"
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import React, {useState} from "react";
import Typography from "@mui/material/Typography";
import QuickstartPage from "@/app/(simulations)/behavioral/(components)/QuickstartPage";
import BehavioralSimulationPage from "@/app/(simulations)/behavioral/(components)/BehavioralSimulationPage";
import {CircularProgress} from "@mui/material";
import DefaultAppLayout from "../../DefaultAppLayout";
import app from "@/lib/firebase";
import "./(components)/BehavioralSimulationPage.css";
import { m } from "framer-motion";

export default function BehavioralInterviewSimulation() {
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState("");
    const [jobRole, setJobRole] = useState("");
    const [numQuestions, setNumQuestions] = useState(3);
    const [questionTypes, setQuestionTypes] = useState([]);
    const [interviewerDifficulty, setInterviewerDifficulty] = useState("easy-going-personality");
    const [showQuickstart, setShowQuickstart] = useState(true);
    const [showSimulation, setShowSimulation] = useState(false);


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
            questionTypes,
            interviewerDifficulty
        }),
        });

        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQuestions(data.questions);
        setShowSimulation(true);

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
        setError(""); // Clear error on input change
    };

    // Handles the array of question types
    const handleQuestionTypesChange = (event) => {
        setQuestionTypes(event.target.value);
        console.log('Question types updated:', event.target.value);
    };

    const handleGetStarted = () => {
        setError("");
        if (!jobRole || jobRole.trim() === '') {
            setError('Please enter a target role');
            return false;
        }

        // Check if job role is too short
        if (jobRole.trim().length < 4) {
            setError('Target role must be at least 4 characters long');
            return false;
        }

        // Check if job role is too long
        if (jobRole.trim().length > 100) {
            setError('Target role must be less than 100 characters');
            return false;
        }

        if (!error) {
            setShowQuickstart(false);
            // getting backend questions
            fetchQuestions();
        }
    }

    // Handles interviewer difficulty changes
    const handleInterviewerDifficultyChange = (difficulty) => {
        setInterviewerDifficulty(difficulty);
        console.log("Interviewer difficulty set to:", difficulty);
    }

    return (
        <Box className="behavioral-container">
            <DefaultAppLayout>
                {/* --------- main content --------- */}
                {showQuickstart ? (
                    <QuickstartPage
                        error={error}
                        jobRole={jobRole}
                        numQuestions={numQuestions}
                        questionTypes={questionTypes}
                        interviewerDifficulty={interviewerDifficulty}
                        handleJobRoleChange={handleJobRoleChange}
                        handleQuestionsChange={handleQuestionsChange}
                        handleQuestionTypesChange={handleQuestionTypesChange}
                        handleGetStarted={handleGetStarted}
                        handleInterviewerDifficultyChange={handleInterviewerDifficultyChange}
                    />
                ) : (
                    <Box
                        component="main"
                        className="behavioral-main-content"
                    >
                        {/* question box component */}
                        <Box component="main" className="behavioral-question-box">
                            {questions && questions.length > 0 && showSimulation ? (
                                <BehavioralSimulationPage questions={questions}/>
                            ) : (
                                <Box className="behavioral-loading-overlay">
                                    {/* Loading content container */}
                                    <Box className="behavioral-loading-container" style={{ textAlign: 'center' }}>
                                        <CircularProgress
                                            size={60}
                                            className="behavioral-loading-spinner"
                                        />
                                        <Typography className="behavioral-loading-text">
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