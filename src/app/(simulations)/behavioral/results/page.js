"use client";

import CssBaseline from "@mui/material/CssBaseline";
import MainAppBar from "../../../../../components/MainAppBar";
import LeftNavbar from "../../../../../components/LeftNavbar";
import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { getTranscriptContentForQuestion } from "./FeedbackTabs";
import DefaultAppLayout from "../../../DefaultAppLayout";
export default function InterviewResults() {
    const [selectedTab, setSelectedTab] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [interviewData, setInterviewData] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [tabs, setTabs] = useState([
        {
            icon: "📊",
            label: "Statistics",
            content: "<div class='text-left'><p>Interview analytics will appear here</p></div>"
        },
        {
            icon: "💡",
            label: "Advice",
            content: "<div class='text-left'><p>Personalized feedback will appear here</p></div>"
        },
        {
            icon: "📜",
            label: "Transcript",
            content: "<div class='text-left'><p>Loading your interview transcript...</p></div>"
        }
    ]);

    // Get sessionId from URL or sessionStorage on the client side
    useEffect(() => {
        // This only runs on the client side, so it's safe for static export
        const urlParams = new URLSearchParams(window.location.search);
        const sessionIdFromUrl = urlParams.get('sessionId');
        const sessionIdFromStorage = sessionStorage.getItem("interviewSessionId");
        
        const finalSessionId = sessionIdFromUrl || sessionIdFromStorage;
        setSessionId(finalSessionId);
    }, []);

    // Fetch interview results from backend
    const fetchInterviewResults = async () => {
        try {
            if (!sessionId) throw new Error('No session ID provided');
            console.log("Fetching results for session:", sessionId);

            const response = await fetch(
                `https://wing-it-un4w.onrender.com/get-all-responses/${sessionId}`
            );
            const data = await response.json();
            console.log("fetched data:", data); // Debugging

            if (!response.ok) throw new Error('Failed to fetch results');
            return data;
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message);
            return null;
        }
    };

    // Update transcript tab content
    const updateTranscriptTab = async (specificQuestion = null) => {
        try {
            setIsLoading(true);
            const result = await getTranscriptContentForQuestion(
                specificQuestion,
                sessionId
            );

            // Update the transcript tab with new content
            setTabs(currentTabs =>
                currentTabs.map(tab =>
                    tab.label === "Transcript"
                        ? { ...tab, content: result.html }
                        : tab
                )
            );

            setIsLoading(false);
            return result;
        } catch (err) {
            console.error("Error updating transcript tab:", err);
            setIsLoading(false);
            return { html: "<p>Error loading transcript data</p>", data: null };
        }
    };

    // Update statistics tab with filler word analytics
    const updateStatisticsTab = (responses) => {
        if (!responses || Object.keys(responses).length === 0) {
            return;
        }

        // Collect all filler words
        let allFillerWords = [];
        let fillerWordsPerQuestion = {};
        let totalWords = 0;
        let totalResponseLength = 0;

        Object.entries(responses).forEach(([questionNum, response]) => {
            const fillerWords = response.filler_words || [];
            allFillerWords = [...allFillerWords, ...fillerWords];

            // Count words in transcript
            const wordCount = response.transcript ? response.transcript.split(/\s+/).length : 0;
            totalWords += wordCount;
            totalResponseLength += response.transcript ? response.transcript.length : 0;

            fillerWordsPerQuestion[questionNum] = fillerWords.length;
        });

        // Calculate statistics
        const totalFillerWords = allFillerWords.length;
        const fillerWordPercentage = totalWords ? ((totalFillerWords / totalWords) * 100).toFixed(1) : 0;
        const averageResponseLength = Object.keys(responses).length ? 
            Math.round(totalResponseLength / Object.keys(responses).length) : 0;

        // Generate statistics HTML
        const statisticsContent = `
            <div class='text-left'>
                <h3 class='text-2xl font-bold mb-6'>Interview Statistics</h3>
                <div class='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div class='bg-white p-6 rounded-lg shadow-sm'>
                        <h4 class='text-lg font-semibold mb-3'>Filler Words Analysis</h4>
                        <p class='text-3xl font-bold text-blue-600 mb-2'>${totalFillerWords}</p>
                        <p class='text-sm text-gray-600'>Total filler words used</p>
                        <p class='text-lg font-semibold mt-4'>${fillerWordPercentage}%</p>
                        <p class='text-sm text-gray-600'>Of all words spoken</p>
                    </div>
                    <div class='bg-white p-6 rounded-lg shadow-sm'>
                        <h4 class='text-lg font-semibold mb-3'>Response Length</h4>
                        <p class='text-3xl font-bold text-green-600 mb-2'>${totalWords}</p>
                        <p class='text-sm text-gray-600'>Total words spoken</p>
                        <p class='text-lg font-semibold mt-4'>${averageResponseLength}</p>
                        <p class='text-sm text-gray-600'>Average response length (characters)</p>
                    </div>
                </div>
                <div class='mt-6'>
                    <h4 class='text-lg font-semibold mb-3'>Filler Words per Question</h4>
                    <div class='bg-white p-4 rounded-lg shadow-sm'>
                        ${Object.entries(fillerWordsPerQuestion).map(([qNum, count]) => 
                            `<div class='flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0'>
                                <span>Question ${qNum}</span>
                                <span class='font-semibold ${count === 0 ? 'text-green-600' : count <= 3 ? 'text-yellow-600' : 'text-red-600'}'>${count} filler words</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;

        setTabs(currentTabs =>
            currentTabs.map(tab =>
                tab.label === "Statistics"
                    ? { ...tab, content: statisticsContent }
                    : tab
            )
        );
    };

    // Generate advice based on interview performance
    const generateAdviceTab = (responses) => {
        if (!responses || Object.keys(responses).length === 0) {
            return;
        }

        // Analyze performance
        let totalFillerWords = 0;
        let totalWords = 0;
        let shortResponses = 0;
        const questionsCount = Object.keys(responses).length;

        Object.values(responses).forEach(response => {
            const fillerWords = response.filler_words || [];
            const wordCount = response.transcript ? response.transcript.split(/\s+/).length : 0;
            
            totalFillerWords += fillerWords.length;
            totalWords += wordCount;
            
            if (wordCount < 50) shortResponses++;
        });

        const fillerWordRate = totalWords ? (totalFillerWords / totalWords) * 100 : 0;
        
        // Generate personalized advice
        let adviceContent = `
            <div class='text-left'>
                <h3 class='text-2xl font-bold mb-6'>Personalized Feedback & Advice</h3>
        `;

        // Filler words advice
        if (fillerWordRate < 2) {
            adviceContent += `
                <div class='bg-green-50 border-l-4 border-green-500 p-4 mb-4'>
                    <h4 class='text-lg font-semibold text-green-800 mb-2'>✅ Excellent Speech Clarity</h4>
                    <p class='text-green-700'>You maintained excellent speech clarity with very few filler words (${fillerWordRate.toFixed(1)}%). Keep up this professional communication style!</p>
                </div>
            `;
        } else if (fillerWordRate < 5) {
            adviceContent += `
                <div class='bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4'>
                    <h4 class='text-lg font-semibold text-yellow-800 mb-2'>⚠️ Moderate Filler Word Usage</h4>
                    <p class='text-yellow-700'>You used filler words ${fillerWordRate.toFixed(1)}% of the time. Try pausing briefly instead of using "um" or "uh" to collect your thoughts.</p>
                </div>
            `;
        } else {
            adviceContent += `
                <div class='bg-red-50 border-l-4 border-red-500 p-4 mb-4'>
                    <h4 class='text-lg font-semibold text-red-800 mb-2'>🎯 Focus on Speech Clarity</h4>
                    <p class='text-red-700'>High filler word usage (${fillerWordRate.toFixed(1)}%) detected. Practice speaking slower and taking brief pauses to gather your thoughts before responding.</p>
                </div>
            `;
        }

        // Response length advice
        if (shortResponses > questionsCount / 2) {
            adviceContent += `
                <div class='bg-blue-50 border-l-4 border-blue-500 p-4 mb-4'>
                    <h4 class='text-lg font-semibold text-blue-800 mb-2'>💡 Expand Your Responses</h4>
                    <p class='text-blue-700'>Several of your responses were quite brief. Try using the STAR method (Situation, Task, Action, Result) to provide more detailed examples.</p>
                </div>
            `;
        }

        // General improvement tips
        adviceContent += `
            <div class='bg-gray-50 p-4 rounded-lg mt-6'>
                <h4 class='text-lg font-semibold mb-3'>💪 Tips for Improvement</h4>
                <ul class='list-disc pl-5 space-y-2'>
                    <li>Practice the STAR method for behavioral questions</li>
                    <li>Record yourself answering common questions to identify speech patterns</li>
                    <li>Take a brief pause before answering to collect your thoughts</li>
                    <li>Prepare specific examples from your experience beforehand</li>
                    <li>Focus on speaking at a moderate pace - don't rush</li>
                </ul>
            </div>
            </div>
        `;

        setTabs(currentTabs =>
            currentTabs.map(tab =>
                tab.label === "Advice"
                    ? { ...tab, content: adviceContent }
                    : tab
            )
        );
    };

    // Load data when sessionId is available
    useEffect(() => {
        if (!sessionId) return;

        const loadResults = async () => {
            setIsLoading(true);

            console.log("Using session ID for results:", sessionId);

            // Fetch all results
            const result = await fetchInterviewResults();

            if (result && result.success && result.responses) {
                setInterviewData(result);

                // Extract questions from the response data
                const questionsList = Object.entries(result.responses).map(([num, response]) => ({
                    number: num,
                    text: response.question_text || `Question ${num}`
                }));

                // Sort questions by number
                questionsList.sort((a, b) => parseInt(a.number) - parseInt(b.number));
                setQuestions(questionsList);

                console.log("Found questions:", questionsList.map(q => q.number));

                // Update all tabs with data
                const transcriptResult = await updateTranscriptTab();
                updateStatisticsTab(result.responses);
                generateAdviceTab(result.responses);

                // Select transcript tab by default
                setSelectedTab(tabs.find(tab => tab.label === "Transcript"));
                setIsLoading(false);
            } else {
                setError("No interview data found or error retrieving data");
                setIsLoading(false);
            }
        };

        loadResults();
    }, [sessionId]);

    // Effect to initialize selectedTab after tabs are updated
    useEffect(() => {
        if (!selectedTab && tabs.length > 0) {
            setSelectedTab(tabs.find(tab => tab.label === "Transcript") || tabs[0]);
        }
    }, [tabs, selectedTab]);

    // Handle question selection
    const handleQuestionSelect = async (number) => {
        setIsLoading(true);
        setQuestionNumber(number);

        await updateTranscriptTab(number);

        setIsLoading(false);
    };

    // Handle "All Questions" button
    const handleViewAllQuestions = async () => {
        setIsLoading(true);
        setQuestionNumber(null);
        await updateTranscriptTab();
        setIsLoading(false);
    };

    // Question button component
    const QuestionButton = ({ number, text }) => (
        <button
            className={`
                rounded-2xl bg-gradient-to-r
                ${questionNumber === number ? 
                    'from-blue-500 to-blue-600 text-white shadow-lg' : 
                    'from-color6BAEDB to-colorACD9DB text-color282523'
                }
                w-full font-satoshi shadow-[0_6px_#1d3557]
                text-lg px-4 py-3 hover:from-color307999
                hover:to-color6EAFCC active:shadow-[0_3px_#1d3557] 
                active:translate-y-1 focus:outline-none transition-all duration-150
            `}
            onClick={() => handleQuestionSelect(number)}
        >
            Q{number}
        </button>
    );

    if (!sessionId) {
        return (
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <DefaultAppLayout title="Behavioral Interview Simulation" color="#2850d9">
                    <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}>
                        <Toolbar />
                        <Box sx={{ textAlign: "center", mt: 4 }}>
                            <Typography variant="h6" color="error">
                                No session ID found. Please complete an interview first.
                            </Typography>
                            <Link href="/behavioral" style={{ textDecoration: 'none' }}>
                                <Typography variant="body1" sx={{ mt: 2, color: 'primary.main' }}>
                                    Start a new interview
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </DefaultAppLayout>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <DefaultAppLayout title="Behavioral Interview Simulation" color="#2850d9">
                    <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}>
                        <Toolbar />
                        <Box sx={{ textAlign: "center", mt: 4 }}>
                            <Typography variant="h6" color="error">
                                {error}
                            </Typography>
                            <Link href="/behavioral" style={{ textDecoration: 'none' }}>
                                <Typography variant="body1" sx={{ mt: 2, color: 'primary.main' }}>
                                    Try again
                                </Typography>
                            </Link>
                        </Box>
                    </Box>
                </DefaultAppLayout>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <DefaultAppLayout title="Behavioral Interview Simulation" color="#2850d9">
                <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default" }}>
                    <Toolbar />
                    <div className="min-h-screen bg-gradient-to-br from-colorFAF8F1 via-white to-colorF3F1EB p-6">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-bold text-color282523 mb-4">
                                    Your Interview Results
                                </h1>
                                <p className="text-xl text-color282523/80">
                                    Review your performance and get personalized feedback
                                </p>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <CircularProgress size={60} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                    {/* Left Panel - Question Navigation */}
                                    <div className="lg:col-span-1">
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                                            <h3 className="text-xl font-bold text-color282523 mb-4">
                                                Questions
                                            </h3>
                                            <div className="space-y-3">
                                                <button
                                                    className={`
                                                        rounded-2xl bg-gradient-to-r w-full font-satoshi shadow-[0_6px_#1d3557]
                                                        text-lg px-4 py-3 transition-all duration-150
                                                        ${questionNumber === null ? 
                                                            'from-green-500 to-green-600 text-white shadow-lg' : 
                                                            'from-color6BAEDB to-colorACD9DB text-color282523'
                                                        }
                                                        hover:from-color307999 hover:to-color6EAFCC 
                                                        active:shadow-[0_3px_#1d3557] active:translate-y-1 focus:outline-none
                                                    `}
                                                    onClick={handleViewAllQuestions}
                                                >
                                                    All Questions
                                                </button>
                                                {questions.map((q) => (
                                                    <QuestionButton
                                                        key={q.number}
                                                        number={q.number}
                                                        text={q.text}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Panel - Content */}
                                    <div className="lg:col-span-3">
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
                                            {/* Tab Navigation */}
                                            <div className="flex border-b border-gray-200">
                                                {tabs.map((tab, index) => (
                                                    <button
                                                        key={index}
                                                        className={`
                                                            flex items-center space-x-2 px-6 py-4 text-lg font-medium transition-all duration-200
                                                            ${selectedTab?.label === tab.label
                                                                ? 'bg-gradient-to-r from-color6BAEDB to-colorACD9DB text-color282523 border-b-2 border-color282523'
                                                                : 'text-color282523/70 hover:text-color282523 hover:bg-gray-50'
                                                            }
                                                        `}
                                                        onClick={() => setSelectedTab(tab)}
                                                    >
                                                        <span className="text-xl">{tab.icon}</span>
                                                        <span>{tab.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Tab Content */}
                                            <div className="p-6">
                                                <AnimatePresence mode="wait">
                                                    {selectedTab && (
                                                        <motion.div
                                                            key={selectedTab.label}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ duration: 0.2 }}
                                                            dangerouslySetInnerHTML={{
                                                                __html: selectedTab.content
                                                            }}
                                                        />
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-center mt-8 space-x-4">
                                <Link href="/behavioral" className="no-underline">
                                    <button className="bg-gradient-to-r from-color6BAEDB to-colorACD9DB text-color282523 px-8 py-3 rounded-full font-semibold shadow-lg hover:from-color307999 hover:to-color6EAFCC transition-all duration-200 transform hover:scale-105">
                                        Take Another Interview
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Box>
            </DefaultAppLayout>
        </Box>
    );
}