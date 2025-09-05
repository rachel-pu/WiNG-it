"use client";

import CssBaseline from "@mui/material/CssBaseline";
import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import DefaultAppLayout from "../../../DefaultAppLayout";

export default function InterviewResults() {
    const [selectedTab, setSelectedTab] = useState(null);
    const [questionNumber, setQuestionNumber] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Changed to false to see content immediately
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
            content: "<div class='text-left'><p>Your interview transcript will appear here</p></div>"
        }
    ]);

    // Simplified mock data for testing
    useEffect(() => {
        // Mock questions for display
        setQuestions([
            { number: "1", text: "Question 1" },
            { number: "2", text: "Question 2" }, 
            { number: "3", text: "Question 3" }
        ]);
        
        // Set default selected tab
        setSelectedTab(tabs.find(tab => tab.label === "Transcript") || tabs[0]);
    }, []);

    // Handle question selection
    const handleQuestionSelect = (number) => {
        setQuestionNumber(number);
        // Simple content update for testing
        const updatedTabs = tabs.map(tab =>
            tab.label === "Transcript"
                ? { ...tab, content: `<div class='text-left'><p>Transcript for Question ${number}</p></div>` }
                : tab
        );
        setTabs(updatedTabs);
        setSelectedTab(updatedTabs.find(tab => tab.label === "Transcript"));
    };

    // Handle "All Questions" button
    const handleViewAllQuestions = () => {
        setQuestionNumber(null);
        const updatedTabs = tabs.map(tab =>
            tab.label === "Transcript"
                ? { ...tab, content: "<div class='text-left'><p>All questions transcript</p></div>" }
                : tab
        );
        setTabs(updatedTabs);
        setSelectedTab(updatedTabs.find(tab => tab.label === "Transcript"));
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