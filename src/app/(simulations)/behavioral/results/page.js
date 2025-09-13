"use client";

import React, { useState, useEffect} from "react";
import { Box, Typography, CircularProgress, Card, Grid, Chip, CssBaseline, Toolbar, Avatar, LinearProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DefaultAppLayout from "../../../DefaultAppLayout";
import Link from "next/link";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from "next/navigation";
import { getInterviewResults } from "../../../../lib/firebase.js";
import "./result.css"

export default function InterviewResults() {
    const [selectedQuestion, setSelectedQuestion] = useState(1);
    const [bannerExpanded, setBannerExpanded] = useState(true);
    const [recordedTimes, setRecordedTimes] = useState([]);
    const [interviewData, setInterviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalAverageRecordedTime, setTotalAverageRecordedTime] = useState();
    const router = useRouter();

    function calculatePerformanceScoreDiminishing({responseTime, wordCount, fillerWords, actionWords, statsUsed}) {
        //input validation
        if (!responseTime || !wordCount || fillerWords < 0 || actionWords < 0 || statsUsed < 0){
            console.log(!responseTime)
            return 0;
        }

        //hard penalize little to no response
        if (wordCount < 10){
            return Math.round(wordCount * 1.5);
        }

        let score = 100;

         //penalize extremely long response
        if (responseTime > 300) {
            score -= Math.min((responseTime - 300) * 0.05, 10);
        }

        // 1. Response time penalty
        if (responseTime < 20) {
            const deduction = Math.min((60 - responseTime) * 0.2, 12);
            score -= deduction;
        }

        // 2. Word count penalty
        if (wordCount < 50) {
            const deduction = Math.min((100 - wordCount) * 0.07, 7);
            score -= deduction;
        }

        // 3. Filler words ratio penalty
        if (wordCount > 0) {
            const ratio = fillerWords / wordCount;
            if (ratio > 0.05) {
                const excess = ratio - 0.05;
                const deduction = Math.min(Math.pow(excess * 100, 1.2), 15); // more severe
                score -= deduction;
            }
        }

        if (wordCount > 300) {
            const deduction = Math.min((wordCount - 300) * 0.05, 5);
            score -= deduction;
        }


        // 4. Action words points with diminishing returns
        score += harmonicPoints(actionWords) * 1.2;

        // 5. Stats used points with diminishing returns
        score += harmonicPoints(statsUsed);

        // 6. Time efficiency bonus
        if (responseTime >= 60 && responseTime <= 180) {
            // scale linearly from 0 to 5 points
            const bonus = ((responseTime - 60) / (180 - 60)) * 5;
            score += bonus;
        }

        // 7. Consistency penalty: words vs time
        const wordsPerSecond = wordCount / responseTime;
        if (wordsPerSecond < 1) {
            score -= Math.min((1 - wordsPerSecond) * 20, 10);
        } else if (wordsPerSecond > 4) {
            score -= Math.min((wordsPerSecond - 4) * 10, 10);
        }

        // 8. Cap score between 0 and 100
        score = Math.max(0, Math.min(100, score));

        return Math.round(score);
    }

    function harmonicPoints(count) {
        let points = 0;
        for (let i = 1; i <= count; i++) {
            points += 1 / i;
        }
        return points;
    }

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Get the session ID from sessionStorage
                const sessionId = sessionStorage.getItem("interviewSessionId");
                if (!sessionId) {
                    setError("No session ID found");
                    setLoading(false);
                    return;
                }

                console.log("Fetching interview results for session:", sessionId);
                
                // Call the backend function
                const result = await getInterviewResults({ sessionId});
                console.log("Backend response:", result);

                if (result.data && result.data.success) {
                    setInterviewData(result.data);
                    
                    // Calculate recorded times for backward compatibility
                    const responses = result.data.responses || [];
                    // Filter out null responses and map to times array
                    const validResponses = Array.isArray(responses) 
                        ? responses.filter(response => response !== null && response !== undefined)
                        : Object.values(responses).filter(response => response !== null && response !== undefined);
                    
                    const times = validResponses.map((data, index) => ({
                        questionNumber: data?.questionNumber || (index + 1),
                        recordedTime: data?.recordedTime || null,
                    }));

                    setRecordedTimes(times);
                    
                    if (times.length > 0) {
                        const timesArray = times.map(t => t.recordedTime || 0);
                        const avgSeconds = timesArray.reduce((acc, curr) => acc + curr, 0) / timesArray.length;
                        
                        const totalSeconds = Math.round(avgSeconds);
                        const minutes = Math.floor(totalSeconds / 60);
                        const seconds = String(totalSeconds % 60).padStart(2, "0");

                        setTotalAverageRecordedTime(`${minutes}:${seconds}`);
                    }
                } else {
                    setError("Failed to fetch interview results");
                }
            } catch (err) {
                console.error("Error fetching interview results:", err);
                setError(err.message || "Failed to fetch interview results");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Process real interview data into the expected format
    const processInterviewData = (data) => {
        if (!data || !data.responses) return {};
        
        const processedData = {};
        
        // Filter out null responses and convert array to entries
        const validResponses = data.responses.filter(response => response !== null && response !== undefined);
        
        validResponses.forEach((response, index) => {
            // Use the response's questionNumber if available, otherwise use 1-based index
            const questionNumber = response?.questionNumber || (index + 1);
            const analysis = response?.analysis || {};
            
            // Calculate performance score using the existing function
            const score = calculatePerformanceScoreDiminishing({
                responseTime: response.recordedTime || 0,
                wordCount: analysis?.totalWords || 0,
                fillerWords: analysis?.fillerWordCount || 0,
                actionWords: 0,
                statsUsed: 0 
            });

            // Extract action words and stats from transcript
            const transcript = response?.transcript || "";
            const actionWordsList = extractActionWords(transcript);
            const statsUsed = extractStats(transcript);
            
            processedData[questionNumber] = {
                question: response?.questionText || `Question ${questionNumber}`,
                responseTime: analysis?.recordedTime || 0,
                wordCount: analysis?.totalWords || 0,
                fillerWords: analysis?.fillerWordCount || 0,
                actionWords: actionWordsList.length,
                statsUsed: statsUsed.length,
                transcript: transcript,
                fillerWordsList: analysis?.fillerWords?.map(fw => fw?.word || '') || [],
                actionWordsList: actionWordsList,
                score: score,
                strengths: generateStrengths(analysis, actionWordsList.length, statsUsed.length),
                improvements: generateImprovements(analysis),
                tips: generateTips(analysis)
            };
        });
        
        return processedData;
    };

    // Helper function to extract action words from transcript
    const extractActionWords = (text) => {
        const commonActionWords = [
            "achieved", "analyzed", "built", "collaborated", "created", "delivered", "developed",
            "directed", "implemented", "improved", "increased", "led", "managed", "organized",
            "resolved", "worked", "decided", "approach", "helped", "noticed", "took", "mentored"
        ];
        
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        return commonActionWords.filter(actionWord => words.includes(actionWord));
    };

    // Helper function to extract statistics/numbers from transcript
    const extractStats = (text) => {
        const numberPattern = /\b\d+(?:\.\d+)?(?:%|percent|million|billion|thousand|k|m|b)?\b/gi;
        return text.match(numberPattern) || [];
    };

    // Helper function to generate strengths based on analysis
    const generateStrengths = (analysis, actionWords, statsUsed) => {
        const strengths = [];
        
        if (statsUsed > 0) {
            strengths.push(`Used specific metrics (${statsUsed} quantified results)`);
        }
        if (actionWords >= 5) {
            strengths.push("Strong use of action words showing impact");
        }
        if (analysis?.transcriptionConfidence > 0.8) {
            strengths.push("Clear and confident speech delivery");
        }
        if (analysis?.fillerWordPercentage < 5) {
            strengths.push("Minimal use of filler words");
        }
        
        return strengths.length > 0 ? strengths : ["Completed the response within time limit"];
    };

    // Helper function to generate improvements based on analysis
    const generateImprovements = (analysis) => {
        const improvements = [];
        
        if (analysis?.fillerWordPercentage > 10) {
            improvements.push(`Reduce filler words (${analysis?.fillerWordCount || 0} detected)`);
        }
        if (analysis?.totalWords < 100) {
            improvements.push("Provide more detailed examples and context");
        }
        if (analysis?.durationSeconds < 60) {
            improvements.push("Expand your answers with more specific details");
        }
        
        return improvements.length > 0 ? improvements : ["Continue practicing to maintain consistency"];
    };

    // Helper function to generate tips based on analysis
    const generateTips = (analysis) => {
        const tips = [];
        
        if (analysis?.fillerWordPercentage > 5) {
            tips.push("Practice the 'pause and breathe' technique to reduce filler words");
        }
        if (analysis?.totalWords < 150) {
            tips.push("Use the STAR method: Situation, Task, Action, Result");
        }
        
        tips.push("Record yourself practicing to identify speech patterns");
        
        return tips.slice(0, 3);
    };

    // Mock data for fallback (when no real data is available)
    const mockQuestionData = {
        1: {
            question: "Tell me about a time when you had to work with a difficult team member.",
            responseTime: 120, // seconds
            wordCount: 156,
            fillerWords: 3,
            actionWords: 6,
            statsUsed: 2,
            transcript: "In my previous internship at TechCorp, I worked with a team member who was consistently missing deadlines and not communicating effectively. I decided to approach them directly and professionally to understand what challenges they were facing. I discovered they were overwhelmed with their workload and unclear about priorities. I helped them break down tasks into manageable pieces and set up weekly check-ins to track progress. As a result, our team's productivity increased by 30% and we delivered our project two weeks ahead of schedule.",
            fillerWordsList: ["um", "uh", "like"],
            actionWordsList: ["worked", "decided", "approach", "helped", "delivered", "increased"],
            score: 85,
            strengths: [
                "Used specific metrics (30% productivity increase)",
                "Showed proactive problem-solving approach",
                "Demonstrated leadership and empathy"
            ],
            improvements: [
                "Could reduce filler words (3 detected)",
                "Add more context about the project timeline",
                "Include more details about the team size"
            ],
            tips: [
                "Practice the STAR method: Situation, Task, Action, Result",
                "Prepare specific numbers and metrics beforehand",
                "Record yourself to identify speech patterns"
            ]
        },
        2: {
            question: "Describe a situation where you had to meet a tight deadline.",
            responseTime: 95,
            wordCount: 142,
            fillerWords: 1,
            actionWords: 8,
            statsUsed: 4,
            transcript: "During my final semester, I had to complete a capstone project in just three weeks instead of the usual eight weeks due to a scheduling conflict. I immediately created a detailed project timeline, identified the most critical components, and reached out to my professor for guidance on prioritization. I worked 60 hours per week, collaborated with two classmates for peer review, and utilized office hours extensively. Despite the compressed timeline, I delivered a high-quality project that received an A grade and was selected for presentation at the university showcase.",
            fillerWordsList: ["uh"],
            actionWordsList: ["created", "identified", "reached", "worked", "collaborated", "utilized", "delivered", "selected"],
            score: 92,
            strengths: [
                "Excellent use of specific metrics (3 weeks vs 8 weeks, 60 hours/week)",
                "Clear problem-solving methodology",
                "Strong outcome with measurable results"
            ],
            improvements: [
                "Could elaborate more on the collaboration process",
                "Add details about specific challenges faced"
            ],
            tips: [
                "Continue using specific timeframes and numbers",
                "Consider adding more emotional context",
                "Practice smooth transitions between points"
            ]
        },
        3: {
            question: "Give me an example of when you showed leadership.",
            responseTime: 110,
            wordCount: 178,
            fillerWords: 5,
            actionWords: 7,
            statsUsed: 3,
            transcript: "As a teaching assistant for an introductory programming course, I noticed that many students were struggling with the basic concepts and falling behind. I took the initiative to organize weekly study sessions outside of regular class hours. I created supplementary materials, including practice problems and visual guides, to help explain complex topics. Over the course of the semester, I mentored 15 students individually and saw their average test scores improve by 25%. The professor was so impressed that they asked me to continue as head TA the following semester.",
            fillerWordsList: ["um", "uh", "so", "like", "you know"],
            actionWordsList: ["noticed", "took", "organize", "created", "mentored", "improve", "asked"],
            score: 78,
            strengths: [
                "Showed initiative and proactive thinking",
                "Quantified impact with specific numbers",
                "Demonstrated sustained commitment over time"
            ],
            improvements: [
                "Reduce filler words (5 detected - highest count)",
                "Could add more details about the challenges faced",
                "Include more specifics about the materials created"
            ],
            tips: [
                "Practice speaking more slowly to reduce filler words",
                "Use the 'pause and breathe' technique",
                "Prepare transition phrases to connect ideas smoothly"
            ]
        }
    };

    // Use processed data or fallback to mock data
    const questionData = interviewData ? processInterviewData(interviewData) : mockQuestionData;

    // Show loading state
    if (loading) {
        return (
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <DefaultAppLayout title="Interview Results" color="#2850d9">
                    <Box sx={{ 
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                    }}>
                        <CircularProgress size={60} />
                        <Typography sx={{ ml: 2, fontSize: '1.2rem', color: '#374151' }}>
                            Loading your results...
                        </Typography>
                    </Box>
                </DefaultAppLayout>
            </Box>
        );
    }

    // Show error state
    if (error) {
        return (
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <DefaultAppLayout title="Interview Results" color="#2850d9">
                    <Box sx={{ 
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                    }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <ErrorIcon sx={{ fontSize: 60, color: '#ef4444', mb: 2 }} />
                            <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#374151', mb: 1 }}>
                                Unable to Load Results
                            </Typography>
                            <Typography sx={{ color: '#6b7280', mb: 3 }}>
                                {error}
                            </Typography>
                            <Link href="/behavioral">
                                <button style={{
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 600
                                }}>
                                    Start New Interview
                                </button>
                            </Link>
                        </Box>
                    </Box>
                </DefaultAppLayout>
            </Box>
        );
    }

    const totalQuestions = Object.keys(questionData).length;
    
    // Ensure selectedQuestion is valid for the current data
    const questionKeys = Object.keys(questionData);
    const validSelectedQuestion = questionKeys.includes(selectedQuestion.toString()) ? selectedQuestion : parseInt(questionKeys[0]) || 1;
    const currentData = questionData[validSelectedQuestion] || Object.values(questionData)[0];

    // Calculate overall performance score
    const overallScore = Math.round(
        Object.values(questionData).reduce((sum, q) => sum + q.score, 0) / totalQuestions
    );

    // Calculate overall statistics for tips
    const avgFillerWords = Math.round(
        Object.values(questionData).reduce((sum, q) => sum + q.fillerWords, 0) / totalQuestions
    );
    const avgActionWords = Math.round(
        Object.values(questionData).reduce((sum, q) => sum + q.actionWords, 0) / totalQuestions
    );
    const avgResponseTime = Object.values(questionData).reduce((sum, q) => sum + q.responseTime, 0) / totalQuestions;

    // Generate overall tips based on performance
    const generateOverallTips = () => {
        const tips = [];
        
        if (avgFillerWords > 3) {
            tips.push("💡 Focus on reducing filler words - try the 'pause and breathe' technique");
        } else if (avgFillerWords <= 1) {
            tips.push("🎉 Excellent speech clarity! Keep up the great work");
        }
        
        if (avgActionWords >= 5) {
            tips.push("💪 Great use of action words - you're showcasing impact effectively");
        } else {
            tips.push("📈 Include more action verbs like 'led,' 'developed,' 'achieved'");
        }
        
        if (avgResponseTime > 150) {
            tips.push("⏱️ Consider being more concise - aim for 90-120 seconds per response");
        } else if (avgResponseTime < 60) {
            tips.push("📝 Expand your answers - provide more specific details and examples");
        }
        
        if (overallScore >= 85) {
            tips.push("🌟 Outstanding performance! You're interview-ready");
        } else if (overallScore >= 70) {
            tips.push("📚 Good foundation - practice a few more scenarios to boost confidence");
        } else {
            tips.push("🎯 Focus on the STAR method: Situation, Task, Action, Result");
        }
        
        return tips.slice(0, 3); // Return top 3 tips
    };

    const overallTips = generateOverallTips();

    // Highlight text function
    const highlightText = (text, fillerWords, actionWords) => {
        if (!text) return text;
        
        // Create arrays of words to highlight, ensuring they exist and are not empty
        const safeFillerWords = Array.isArray(fillerWords) ? fillerWords.filter(word => word && word.trim()) : [];
        const safeActionWords = Array.isArray(actionWords) ? actionWords.filter(word => word && word.trim()) : [];
        
        // Split text into words and spaces to preserve formatting
        const tokens = text.split(/(\s+)/);
        
        return tokens.map(token => {
            // Skip whitespace
            if (/^\s+$/.test(token)) {
                return token;
            }
            
            // Clean the word for comparison (remove punctuation)
            const cleanWord = token.toLowerCase().replace(/[^\w]/g, '');
            if (!cleanWord) return token;
            
            // Check for numbers (including percentages, decimals, etc.)
            if (/^\d+(?:\.\d+)?(?:%|percent|million|billion|thousand|k|m|b)?$/i.test(cleanWord)) {
                return `<span style="background-color: #c1deffff; color: #275377ff; padding: 2px 4px; border-radius: 4px; font-weight: 600;">${token}</span>`;
            }
            
            // Check for action words
            if (safeActionWords.some(actionWord => actionWord.toLowerCase() === cleanWord)) {
                return `<span style="background-color: #d1fae5; color: #065f46; padding: 2px 4px; border-radius: 4px; font-weight: 600;">${token}</span>`;
            }
            
            // Check for filler words
            if (safeFillerWords.some(fillerWord => fillerWord.toLowerCase() === cleanWord)) {
                return `<span style="background-color: #ffd9d9ff; color: #dc2626; padding: 2px 4px; border-radius: 4px; font-weight: 600;">${token}</span>`;
            }
            
            return token;
        }).join('');
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", damping: 20, stiffness: 300 }
        }
    };

    // Performance indicator component
    const PerformanceIndicator = ({ score }) => {
        const getColor = (score) => {
            if (score >= 85) return '#10b981'; // green
            if (score >= 70) return '#f59e0b'; // amber
            return '#ef4444'; // red
        };

        const getLabel = (score) => {
            if (score >= 85) return 'Excellent';
            if (score >= 70) return 'Good';
            return 'Needs Work';
        };

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: `conic-gradient(${getColor(score)} ${score * 3.6}deg, #e5e7eb 0deg)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                >
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            color: getColor(score)
                        }}
                    >
                        {score}
                    </Box>
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 600, color: getColor(score) }}>
                        {getLabel(score)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        Performance Score
                    </Typography>
                </Box>
            </Box>
        );
    };

    // Metric card component
    const MetricCard = ({ icon: Icon, label, value, color = '#3b82f6', subtitle }) => (
        <Card
            sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        backgroundColor: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color
                    }}
                >
                    <Icon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
                        {value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {label}
                    </Typography>
                </Box>
            </Box>
            {subtitle && (
                <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {subtitle}
                </Typography>
            )}
        </Card>
    );

    // Question selector component
    const QuestionSelector = ({ questionNum, isSelected, onClick }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <Card
                onClick={onClick}
                sx={{
                    p: 2,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    background: isSelected ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : '#ffffff',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        borderColor: '#3b82f6',
                        transform: 'translateY(-1px)'
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                backgroundColor: isSelected ? '#3b82f6' : '#e5e7eb',
                                color: isSelected ? 'white' : '#6b7280',
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}
                        >
                            Q{questionNum}
                        </Avatar>
                        <Typography sx={{ fontWeight: 500, color: '#374151', fontSize: '0.9rem' }}>
                            Question {questionNum}
                        </Typography>
                    </Box>
                    <Chip
                        label={questionData[questionNum].score}
                        size="small"
                        sx={{
                            backgroundColor: questionData[questionNum].score >= 85 ? '#d1fae5' : 
                                           questionData[questionNum].score >= 70 ? '#fef3c7' : '#fee2e2',
                            color: questionData[questionNum].score >= 85 ? '#065f46' : 
                                   questionData[questionNum].score >= 70 ? '#92400e' : '#991b1b',
                            fontWeight: 600
                        }}
                    />
                </Box>
            </Card>
        </motion.div>
    );

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <DefaultAppLayout title="Interview Results" color="#2850d9">
                <Box sx={{ 
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    position: 'relative'
                }}>
                    <Toolbar />
                    
                    <Box sx={{ p: { xs: 2, md: 4 } }}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >


                            {/* Overall Performance Banner - Collapsible */}
                            <motion.div variants={itemVariants}>
                                <Card
                                    sx={{
                                        p: 0,
                                        mb: 4,
                                        borderRadius: '24px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 5px 10px rgba(102, 126, 234, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {/* Decorative elements */}
                                    <Box sx={{
                                        position: 'absolute',
                                        top: -50,
                                        right: -50,
                                        width: 150,
                                        height: 150,
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        zIndex: 1
                                    }} />
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: -30,
                                        left: -30,
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        zIndex: 1
                                    }} />
                                    
                                    {/* Header - Always Visible */}
                                    <Box sx={{ 
                                        p: 3, 
                                        position: 'relative', 
                                        zIndex: 2,
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setBannerExpanded(!bannerExpanded)}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '12px',
                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.5rem'
                                                }}>
                                                    🎉
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>
                                                        Interview Complete!
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '1rem', opacity: 0.85 }}>
                                                        You answered {totalQuestions} behavioral interview questions • {overallScore}% overall score
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <motion.div
                                                animate={{ rotate: bannerExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ExpandMoreIcon sx={{ fontSize: '2rem', opacity: 0.7 }} />
                                            </motion.div>
                                        </Box>
                                    </Box>

                                    {/* Expandable Content */}
                                    <AnimatePresence>
                                        {bannerExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <Box sx={{ p: 4, pt: 0, position: 'relative', zIndex: 2 }}>
                                                    <Grid container spacing={4} alignItems="stretch">
                                                        <Grid item xs={12} lg={7}>
                                                            {/* Score Section */}
                                                            <Box sx={{ 
                                                                background: 'rgba(255, 255, 255, 0.15)',
                                                                backdropFilter: 'blur(10px)',
                                                                borderRadius: '16px',
                                                                p: 3,
                                                                mb: 3,
                                                                border: '1px solid rgba(255, 255, 255, 0.2)'
                                                            }}>
                                                                <Typography sx={{ fontSize: '0.9rem', opacity: 0.8, mb: 1 }}>
                                                                    Overall Performance
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                                    <Typography sx={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>
                                                                        {overallScore}%
                                                                    </Typography>
                                                                    <Box sx={{ flex: 1 }}>
                                                                        <LinearProgress
                                                                            variant="determinate"
                                                                            value={overallScore}
                                                                            sx={{
                                                                                height: 12,
                                                                                borderRadius: 6,
                                                                                backgroundColor: 'rgba(255,255,255,0.3)',
                                                                                '& .MuiLinearProgress-bar': {
                                                                                    backgroundColor: '#fbbf24',
                                                                                    borderRadius: 6
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Typography sx={{ fontSize: '0.8rem', opacity: 0.7, mt: 0.5 }}>
                                                                            {overallScore >= 85 ? 'Excellent Performance!' : 
                                                                             overallScore >= 70 ? 'Good Performance!' : 
                                                                             'Room for Improvement'}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            </Box>

                                                            {/* Statistics Grid */}
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={6} sm={3}>
                                                                    <Box sx={{ 
                                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                                        borderRadius: '12px',
                                                                        p: 2,
                                                                        textAlign: 'center',
                                                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            background: 'rgba(255, 255, 255, 0.15)',
                                                                            transform: 'translateY(-2px)'
                                                                        }
                                                                    }}>
                                                                        <Box sx={{ 
                                                                            fontSize: '1.5rem', 
                                                                            mb: 0.5,
                                                                            opacity: 0.7
                                                                        }}>
                                                                            ⏱️
                                                                        </Box>
                                                                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>
                                                                            {totalAverageRecordedTime}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 500 }}>
                                                                            Avg Time
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                                <Grid item xs={6} sm={3}>
                                                                    <Box sx={{ 
                                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                                        borderRadius: '12px',
                                                                        p: 2,
                                                                        textAlign: 'center',
                                                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            background: 'rgba(255, 255, 255, 0.15)',
                                                                            transform: 'translateY(-2px)'
                                                                        }
                                                                    }}>
                                                                        <Box sx={{ 
                                                                            fontSize: '1.5rem', 
                                                                            mb: 0.5,
                                                                            opacity: 0.7
                                                                        }}>
                                                                            📝
                                                                        </Box>
                                                                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>
                                                                            {Math.round(
                                                                                Object.values(questionData).reduce((sum, q) => sum + q.wordCount, 0) / totalQuestions
                                                                            )}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 500 }}>
                                                                            Avg Words
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                                <Grid item xs={6} sm={3}>
                                                                    <Box sx={{ 
                                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                                        borderRadius: '12px',
                                                                        p: 2,
                                                                        textAlign: 'center',
                                                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            background: 'rgba(255, 255, 255, 0.15)',
                                                                            transform: 'translateY(-2px)'
                                                                        }
                                                                    }}>
                                                                        <Box sx={{ 
                                                                            fontSize: '1.5rem', 
                                                                            mb: 0.5,
                                                                            opacity: 0.7
                                                                        }}>
                                                                            🚫
                                                                        </Box>
                                                                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>
                                                                            {avgFillerWords}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 500 }}>
                                                                            Avg Fillers
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                                <Grid item xs={6} sm={3}>
                                                                    <Box sx={{ 
                                                                        background: 'rgba(255, 255, 255, 0.1)',
                                                                        borderRadius: '12px',
                                                                        p: 2,
                                                                        textAlign: 'center',
                                                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            background: 'rgba(255, 255, 255, 0.15)',
                                                                            transform: 'translateY(-2px)'
                                                                        }
                                                                    }}>
                                                                        <Box sx={{ 
                                                                            fontSize: '1.5rem', 
                                                                            mb: 0.5,
                                                                            opacity: 0.7
                                                                        }}>
                                                                            💪
                                                                        </Box>
                                                                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>
                                                                            {avgActionWords}
                                                                        </Typography>
                                                                        <Typography sx={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 500 }}>
                                                                            Avg Actions
                                                                        </Typography>
                                                                    </Box>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        
                                                        <Grid item xs={12} lg={5}>
                                                            <Box sx={{ 
                                                                background: 'rgba(255, 255, 255, 0.1)',
                                                                borderRadius: '20px',
                                                                p: 3,
                                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                                backdropFilter: 'blur(10px)',
                                                                height: '100%',
                                                                display: 'flex',
                                                                flexDirection: 'column'
                                                            }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                                    <Box sx={{ fontSize: '1.5rem' }}>💡</Box>
                                                                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                                                        Key Takeaways
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                                                                    {overallTips.map((tip, index) => (
                                                                        <Box key={index} sx={{ 
                                                                            display: 'flex', 
                                                                            alignItems: 'flex-start', 
                                                                            gap: 2,
                                                                            p: 2,
                                                                            background: 'rgba(255, 255, 255, 0.1)',
                                                                            borderRadius: '12px',
                                                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                                                        }}>
                                                                            <Box sx={{ 
                                                                                width: 6, 
                                                                                height: 6, 
                                                                                borderRadius: '50%', 
                                                                                backgroundColor: '#fbbf24',
                                                                                mt: 0.75,
                                                                                flexShrink: 0
                                                                            }} />
                                                                            <Typography sx={{ 
                                                                                fontSize: '0.9rem', 
                                                                                opacity: 0.9, 
                                                                                lineHeight: 1.4,
                                                                                fontWeight: 500
                                                                            }}>
                                                                                {tip}
                                                                            </Typography>
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>

                            <Grid container spacing={4}>
                                {/* Question Selection Sidebar */}
                                <Grid item xs={12} md={4}>
                                    <motion.div variants={itemVariants}>
                                        <Card sx={{ p: 3, borderRadius: '16px', height: 'fit-content' }}>
                                            <Typography sx={{ fontSize: '1.2rem', fontWeight: 600, mb: 3, color: '#1f2937' }}>
                                                Select Question
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {Object.keys(questionData).map((qNum) => (
                                                    <QuestionSelector
                                                        key={qNum}
                                                        questionNum={qNum}
                                                        isSelected={selectedQuestion == qNum}
                                                        onClick={() => setSelectedQuestion(parseInt(qNum))}
                                                    />
                                                ))}
                                            </Box>
                                        </Card>
                                    </motion.div>
                                </Grid>

                                {/* Main Content */}
                                <Grid item xs={12} md={8}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedQuestion}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* Question Header */}
                                            <Card sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#1f2937', flex: 1, mr: 2 }}>
                                                        {currentData.question}
                                                    </Typography>
                                                    <PerformanceIndicator score={currentData.score} />
                                                </Box>
                                            </Card>

                                            {/* Metrics Grid */}
                                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                                <Grid item xs={6} sm={3}>
                                                    <MetricCard
                                                        icon={AccessTimeIcon}
                                                        label="Seconds"
                                                        value={recordedTimes[selectedQuestion - 1]?.recordedTime}
                                                        color="#8b5cf6"
                        
                                                    />
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <MetricCard
                                                        icon={RecordVoiceOverIcon}
                                                        label="Word Count"
                                                        value={currentData.wordCount}
                                                        color="#06b6d4"
                                                    />
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <MetricCard
                                                        icon={TrendingUpIcon}
                                                        label="Action Words"
                                                        value={currentData.actionWords}
                                                        color="#10b981"
                                                    />
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <MetricCard
                                                        icon={BarChartIcon}
                                                        label="Statistics"
                                                        value={currentData.statsUsed}
                                                        color="#f59e0b"
                                                    />
                                                </Grid>
                                            </Grid>

                                            {/* Transcript */}
                                            <Card sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                                                <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 2, color: '#1f2937' }}>
                                                    📝 Your Response
                                                </Typography>
                                                <Box sx={{ 
                                                    p: 3, 
                                                    backgroundColor: '#f8fafc', 
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0'
                                                }}>
                                                    <Typography 
                                                        sx={{ lineHeight: 1.6, color: '#374151' }}
                                                        dangerouslySetInnerHTML={{
                                                            __html: highlightText(
                                                                currentData.transcript, 
                                                                currentData.fillerWordsList, 
                                                                currentData.actionWordsList
                                                            )
                                                        }}
                                                    />
                                                </Box>
                                                
                                                {/* Legend */}
                                                <Box sx={{ mt: 3, p: 2, borderRadius: '8px' }}>
                                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, color: '#374151' }}>
                                                        Highlight Legend:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ 
                                                                width: 16, 
                                                                height: 16, 
                                                                backgroundColor: '#d1fae5', 
                                                                borderRadius: '4px',
                                                                border: '1px solid #a7f3d0'
                                                            }} />
                                                            <Typography sx={{ fontSize: '0.75rem', color: '#065f46' }}>
                                                                Action Words
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ 
                                                                width: 16, 
                                                                height: 16, 
                                                                backgroundColor: '#C7DDFC', 
                                                                borderRadius: '4px',
                                                                border: '1px solid #6ea7e4ff'
                                                            }} />
                                                            <Typography sx={{ fontSize: '0.75rem', color: '#325274' }}>
                                                                Numbers/Stats
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ 
                                                                width: 16, 
                                                                height: 16, 
                                                                backgroundColor: '#ffd9d9ff', 
                                                                borderRadius: '4px',
                                                                border: '1px solid #fca8a8ff'
                                                            }} />
                                                            <Typography sx={{ fontSize: '0.75rem', color: '#dc2626' }}>
                                                                Filler Words
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                    
                                            </Card>

                                            {/* Analysis & Tips */}
                                            <Grid container spacing={3}>
                                                {/* Strengths */}
                                                <Grid item xs={12} md={4}>
                                                    <Card sx={{ p: 3, borderRadius: '16px', height: '100%' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                            <CheckCircleIcon sx={{ color: '#10b981' }} />
                                                            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                                                                Strengths
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            {currentData.strengths.map((strength, index) => (
                                                                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                                    <Box sx={{ 
                                                                        width: 6, 
                                                                        height: 6, 
                                                                        borderRadius: '50%', 
                                                                        backgroundColor: '#10b981',
                                                                        mt: 0.75,
                                                                        flexShrink: 0
                                                                    }} />
                                                                    <Typography sx={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.4 }}>
                                                                        {strength}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Card>
                                                </Grid>

                                                {/* Areas for Improvement */}
                                                <Grid item xs={12} md={4}>
                                                    <Card sx={{ p: 3, borderRadius: '16px', height: '100%' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                            <ErrorIcon sx={{ color: '#f59e0b' }} />
                                                            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                                                                Improvements
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            {currentData.improvements.map((improvement, index) => (
                                                                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                                    <Box sx={{ 
                                                                        width: 6, 
                                                                        height: 6, 
                                                                        borderRadius: '50%', 
                                                                        backgroundColor: '#f59e0b',
                                                                        mt: 0.75,
                                                                        flexShrink: 0
                                                                    }} />
                                                                    <Typography sx={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.4 }}>
                                                                        {improvement}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Card>
                                                </Grid>

                                                {/* Tips */}
                                                <Grid item xs={12} md={4}>
                                                    <Card sx={{ p: 3, borderRadius: '16px', height: '100%' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                            <InfoIcon sx={{ color: '#3b82f6' }} />
                                                            <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                                                                Tips
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            {currentData.tips.map((tip, index) => (
                                                                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                                    <Box sx={{ 
                                                                        width: 6, 
                                                                        height: 6, 
                                                                        borderRadius: '50%', 
                                                                        backgroundColor: '#3b82f6',
                                                                        mt: 0.75,
                                                                        flexShrink: 0
                                                                    }} />
                                                                    <Typography sx={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.4 }}>
                                                                        {tip}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Card>
                                                </Grid>
                                            </Grid>
                                        </motion.div>
                                    </AnimatePresence>
                                </Grid>
                            </Grid>

                            {/* Action Buttons */}
                            <motion.div variants={itemVariants}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    gap: 3, 
                                    mt: 6,
                                    flexWrap: 'wrap'
                                }}>
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => router.push('/behavioral')}
                                        style={{
                                            padding: '16px 32px',
                                            borderRadius: '50px',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                            color: 'white',
                                            border: 'none',
                                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        🎯 Practice Again
                                    </motion.button>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => router.push('/dashboard')}
                                        style={{
                                            padding: '16px 32px',
                                            borderRadius: '50px',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            background: 'white',
                                            color: '#374151',
                                            border: '2px solid #d1d5db',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        🏠 Back to Dashboard
                                    </motion.button>
                                </Box>
                            </motion.div>
                        </motion.div>
                    </Box>
                </Box>
            </DefaultAppLayout>
        </Box>
    );
}