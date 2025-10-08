"use client"
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import {useState} from "react";
import Typography from "@mui/material/Typography";
import QuickstartPage from "./components/QuickstartPage.jsx";
import BehavioralSimulationPage from "./components/BehavioralSimulationPage.jsx";
import {CircularProgress} from "@mui/material";
import DefaultAppLayout from "../../DefaultAppLayout.jsx";
import "./components/BehavioralSimulationPage.css";

export default function BehavioralInterviewSimulation() {
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState("");
    const [jobRole, setJobRole] = useState("");
    const [company, setCompany] = useState("");
    const [numQuestions, setNumQuestions] = useState(3);
    const [questionTypes, setQuestionTypes] = useState([]);
    const [interviewerDifficulty, setInterviewerDifficulty] = useState("easy-going-personality");
    const [customQuestions, setCustomQuestions] = useState("");
    const [showQuickstart, setShowQuickstart] = useState(true);
    const [showSimulation, setShowSimulation] = useState(false);


    const fetchQuestions = async (isCustom = false, customQuestionsArray = []) => {
    try {
        const response = await fetch('https://us-central1-wing-it-e6a3a.cloudfunctions.net/generateQuestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            job_role: jobRole,
            company,
            numQuestions,
            questionTypes,
            interviewerDifficulty,
            customQuestions: isCustom ? customQuestionsArray : null
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

    const handleCompanyChange = (e) => {
        setCompany(e.target.value);
    };

    const handleCustomQuestionsChange = (e) => {
        setCustomQuestions(e.target.value);
    };

    // Handles the array of question types
    const handleQuestionTypesChange = (event) => {
        setQuestionTypes(event.target.value);
        console.log('Question types updated:', event.target.value);
    };

    const handleGetStarted = (tabIndex) => {
        setError("");

        // Tab 0: AI-Generated Questions
        if (tabIndex === 0) {
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
        // Tab 1: Custom Questions
        else if (tabIndex === 1) {
            const customQuestionsArray = customQuestions
                .split('\n')
                .map(q => q.trim())
                .filter(q => q.length > 0);

            if (customQuestionsArray.length === 0) {
                setError('Please enter at least one question');
                return false;
            }

            if (customQuestionsArray.length > 5) {
                setError('Maximum 5 questions allowed');
                return false;
            }

            if (!error) {
                setShowQuickstart(false);
                // Send custom questions to backend
                fetchQuestions(true, customQuestionsArray);
            }
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
                        company={company}
                        numQuestions={numQuestions}
                        questionTypes={questionTypes}
                        interviewerDifficulty={interviewerDifficulty}
                        customQuestions={customQuestions}
                        handleJobRoleChange={handleJobRoleChange}
                        handleCompanyChange={handleCompanyChange}
                        handleQuestionsChange={handleQuestionsChange}
                        handleQuestionTypesChange={handleQuestionTypesChange}
                        handleGetStarted={handleGetStarted}
                        handleInterviewerDifficultyChange={handleInterviewerDifficultyChange}
                        handleCustomQuestionsChange={handleCustomQuestionsChange}
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
                                <Box className="behavioral-loading-container" style={{ textAlign: 'center' }}>
                                    <CircularProgress
                                        size={60}
                                        className="behavioral-loading-spinner"
                                    />
                                    <Typography className="behavioral-loading-text">
                                        Generating your simulation experience...
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}
            </DefaultAppLayout>  
        </Box>
    );
}