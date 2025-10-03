"use client";

import React, { useState, useEffect} from "react";
import { Box, Typography, CircularProgress, Card, Grid, Chip, CssBaseline, Toolbar, Tabs, Tab } from "@mui/material";
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
import { useRouter } from "next/navigation";
import "./result.css"
import InterviewCompleteScreen from "./InterviewCompleteScreen";

export default function InterviewResults() {
    const [selectedQuestion, setSelectedQuestion] = useState(1);
    const [recordedTimes, setRecordedTimes] = useState([]);
    const [interviewData, setInterviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalAverageRecordedTime, setTotalAverageRecordedTime] = useState();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const [showDetailedResults, setShowDetailedResults] = useState(false);


    function calculatePerformanceScoreDiminishing({starAnswerParsed, responseTime, wordCount, fillerWords, actionWords, statsUsed, interviewerDifficulty = 'easy-going-personality'}) {
        // Input validation
        if (!starAnswerParsed || !responseTime || !wordCount || fillerWords < 0 || actionWords < 0 || statsUsed < 0){
            return 0;
        }

        // Hard penalize little to no response
        if (wordCount < 10){
            return Math.round((wordCount * 1.5) * 0.6); // scale proportionally
        }

        let score = 100; // Keep calculation out of 100 for logic simplicity

        // Difficulty multipliers
        const getDifficultyMultipliers = (difficulty) => {
            switch (difficulty) {
                case 'challenging-personality':
                    return { penaltyMultiplier: 1.4, bonusMultiplier: 0.8, baseThreshold: 0.9 };
                case 'moderate-personality':
                    return { penaltyMultiplier: 1.2, bonusMultiplier: 0.9, baseThreshold: 0.95 };
                case 'easy-going-personality':
                default:
                    return { penaltyMultiplier: 1.0, bonusMultiplier: 1.0, baseThreshold: 1.0 };
            }
        };

        const { penaltyMultiplier, bonusMultiplier, baseThreshold } = getDifficultyMultipliers(interviewerDifficulty);

        // Penalize extremely long response
        if (responseTime > 300) {
            score -= Math.min((responseTime - 300) * 0.05 * penaltyMultiplier, 10 * penaltyMultiplier);
        }

        // Response time penalty
        const minResponseTime = 20 * baseThreshold;
        if (responseTime < minResponseTime) {
            const deduction = Math.min((60 - responseTime) * 0.2 * penaltyMultiplier, 12 * penaltyMultiplier);
            score -= deduction;
        }

        // Word count penalty
        const minWordCount = 50 * baseThreshold;
        if (wordCount < minWordCount) {
            const deduction = Math.min((100 - wordCount) * 0.07 * penaltyMultiplier, 7 * penaltyMultiplier);
            score -= deduction;
        }

        // Filler words penalty
        if (wordCount > 0) {
            const ratio = fillerWords / wordCount;
            const fillerThreshold = 0.05 * baseThreshold;
            if (ratio > fillerThreshold) {
                const excess = ratio - fillerThreshold;
                const deduction = Math.min(Math.pow(excess * 100, 1.2) * penaltyMultiplier, 15 * penaltyMultiplier);
                score -= deduction;
            }
        }

        // Long response penalty
        if (wordCount > 300) {
            const deduction = Math.min((wordCount - 300) * 0.05 * penaltyMultiplier, 5 * penaltyMultiplier);
            score -= deduction;
        }

        // Action words points
        score += harmonicPoints(actionWords) * 1.2 * bonusMultiplier;

        // Stats used points
        score += harmonicPoints(statsUsed) * bonusMultiplier;

        // Time efficiency bonus
        if (responseTime >= 60 && responseTime <= 180) {
            const bonus = ((responseTime - 60) / (180 - 60)) * 5 * bonusMultiplier;
            score += bonus;
        }

        // Words per second consistency penalty
        const wordsPerSecond = wordCount / responseTime;
        if (wordsPerSecond < 1) {
            score -= Math.min((1 - wordsPerSecond) * 20 * penaltyMultiplier, 10 * penaltyMultiplier);
        } else if (wordsPerSecond > 4) {
            score -= Math.min((wordsPerSecond - 4) * 10 * penaltyMultiplier, 10 * penaltyMultiplier);
        }

        // Cap score between 0 and 100
        score = Math.max(0, Math.min(100, score));

        // ✅ Scale score to be out of 60
        score = Math.round(score * 0.6);
        let situationScore = starAnswerParsed.situation ? 10 : 0;
        if (starAnswerParsed.situation) {
            const wordCount = starAnswerParsed.situation.trim().split(/\s+/).length;
            if (wordCount < 20) {
                situationScore -= (20 - wordCount);
                situationScore = Math.max(situationScore, 0);
            }
        }
        let taskScore  = starAnswerParsed.task ? 10 : 0;
        if (starAnswerParsed.task) {
            const wordCount = starAnswerParsed.task.trim().split(/\s+/).length;
            if (wordCount < 20) {
                taskScore -= (20 - wordCount);
                taskScore = Math.max(taskScore, 0);
            }
        }
        let actionScore = starAnswerParsed.action ? 10 : 0;
        if (starAnswerParsed.action) {
            const wordCount = starAnswerParsed.action.trim().split(/\s+/).length;
            if (wordCount < 20) {
                actionScore -= (20 - wordCount);
                actionScore = Math.max(actionScore, 0);
            }
        }
        let resultScore = starAnswerParsed.result ? 10 : 0;
        if (starAnswerParsed.result) {
            const wordCount = starAnswerParsed.result.trim().split(/\s+/).length;
            if (wordCount < 20) {
                resultScore -= (20 - wordCount);
                resultScore = Math.max(resultScore, 0);
            }
        }

        return score + situationScore + taskScore + actionScore + resultScore;
    }

    function harmonicPoints(count) {
        let points = 0;
        for (let i = 1; i <= count; i++) {
            points += 1 / i;
        }
        return points;
    }

    const tabStyle = (isActive) => ({
        padding: '12px 16px',
        fontSize: '1.1rem',
        fontWeight: '600',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: isActive ? '#1f2937' : '#6B7280',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: isActive ? '3px solid #3B82F6' : '3px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        borderRadius: '4px 4px 0 0'
    });

    const contentBoxStyle = {
        padding: '24px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
    };

    const textStyle = {
        lineHeight: '1.6',
        color: '#374151',
        fontFamily: 'system-ui, -apple-system, sans-serif'
    };

    const legendStyle = {
        marginTop: '24px',
        padding: '16px',
        borderRadius: '8px'
    };

    const legendItemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const colorBoxStyle = (bgColor, borderColor) => ({
        width: '16px',
        height: '16px',
        backgroundColor: bgColor,
        borderRadius: '4px',
        border: `1px solid ${borderColor}`
    });
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams(window.location.search);
                const sessionId = params.get("sessionId");

                if (!sessionId) {
                throw new Error("No sessionId found in URL");
                }

                console.log("Fetching interview results for session:", sessionId);
                
                // Call the backend function
                 const res = await fetch(
                "https://us-central1-wing-it-e6a3a.cloudfunctions.net/getInterviewResults",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId }),
                }
                );
                

                if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
                }

                const result = await res.json();;
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
                starAnswerParsed: analysis?.starAnswerParsed,
                responseTime: response.recordedTime || 0,
                wordCount: analysis?.totalWords || 0,
                fillerWords: analysis?.fillerWordCount || 0,
                actionWords: 0,
                statsUsed: 0,
                interviewerDifficulty: data?.interviewerDifficulty || response?.interviewerDifficulty || 'easy-going-personality'
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
                questionTypes: analysis?.questionTypes,
                fillerWordsList: analysis?.fillerWordsList || [],
                actionWordsList: actionWordsList,
                score: score,
                strengths: analysis?.strengths || generateStrengths(analysis, actionWordsList.length, statsUsed.length),
                improvements:  analysis?.improvements || generateImprovements(analysis),
                tips: analysis?.tips ||generateTips(analysis),
                improvedResponse: analysis?.improvedResponse,
                starAnswerParsed: analysis?.starAnswerParsed,
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
                <DefaultAppLayout  elevation={16} title="Interview Results" color="#2850d9" titlecolor="#FFFFFF">
                    <Box sx={{ 
                        position: 'fixed',
                        width: '100%',
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        marginLeft: -30
                    }}>
                        <CircularProgress size={60} />
                        <Typography sx={{ ml: 2, fontSize: '1.2rem', color: '#374151', fontFamily: 'DM Sans' }}>
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
                <DefaultAppLayout  elevation={16} title="Interview Results" color="#2850d9" titlecolor="#FFFFFF">
                    <Box sx={{ 
                        position: 'fixed',
                        width: '100%',
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                    }}>
                        <Box sx={{ textAlign: 'center' , marginLeft:-30 }}>
                            <ErrorIcon sx={{ fontSize: 60, color: '#ef4444', mb: 2 }} />
                            <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#374151', mb: 1, fontFamily: 'Satoshi Bold'}}>
                                Unable to Load Results
                            </Typography>
                            <Typography sx={{ color: '#6b7280', mb: 3, fontFamily: 'DM Sans' }}>
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

const highlightText = (text, fillerWords, actionWords, starAnswerParsed) => {
  if (!text) return text;

  const safeFillerWords = Array.isArray(fillerWords) ? fillerWords.filter(w => w?.trim()) : [];
  const safeActionWords = Array.isArray(actionWords) ? actionWords.filter(w => w?.trim()) : [];

  // STAR underline colors (hex ensures visibility)
  const starColors = {
    situation: '#FBBF24', // yellow-400, visible
    task:      '#3B82F6', // blue
    action:    '#FB923C', // purple
    result:    '#8B5CF6'  // orange
  };

  // Build STAR phrases longest-first
  const starEntries = Object.entries(starAnswerParsed || {})
    .map(([key, val]) => ({ key, phrase: (val || '').trim() }))
    .filter(e => e.phrase)
    .sort((a, b) => b.phrase.length - a.phrase.length);

  if (!starEntries.length) return processNormalSegment(text, safeFillerWords, safeActionWords);

  // Wrap STAR phrases first so outer span holds underline
  let processedText = text;
  starEntries.forEach(({ key, phrase }) => {
    const color = starColors[key] || 'black';
    const regex = new RegExp(escapeRegExp(phrase), 'gi');
    processedText = processedText.replace(regex, match =>
      `<span class="star-phrase" data-color="${color}">${match}</span>`
    );
  });

  // Split by STAR spans to preserve them
  const finalSegments = [];
  const starSpanRegex = /<span class="star-phrase" data-color="(.+?)">([\s\S]*?)<\/span>/g;
  let lastIndex = 0, match;
  while ((match = starSpanRegex.exec(processedText)) !== null) {
    if (match.index > lastIndex) {
      finalSegments.push({ type: 'normal', text: processedText.slice(lastIndex, match.index) });
    }
    finalSegments.push({ type: 'star', text: match[2], color: match[1] });
    lastIndex = starSpanRegex.lastIndex;
  }
  if (lastIndex < processedText.length) {
    finalSegments.push({ type: 'normal', text: processedText.slice(lastIndex) });
  }

  return finalSegments.map(seg => {
    if (seg.type === 'normal') return processNormalSegment(seg.text, safeFillerWords, safeActionWords);
    // Outer span for STAR phrase, inner highlighting applied
    const inner = processNormalSegment(seg.text, safeFillerWords, safeActionWords);
    return `<span style="border-bottom: 3px solid ${seg.color};">${inner}</span>`;
  }).join('');
};

function processNormalSegment(segmentText, safeFillerWords, safeActionWords) {
  const tokens = segmentText.split(/(\s+)/);
  return tokens.map(token => {
    if (/^\s+$/.test(token)) return token;
    const cleanWord = token.toLowerCase().replace(/[^\w]/g, '');
    if (!cleanWord) return token;

    // Check filler words FIRST (higher priority than action words/stats)
    if (safeFillerWords.some(w => w.toLowerCase() === cleanWord)) {
      return `<span style="background-color:#ffd9d9;color:#dc2626;padding:2px 4px;border-radius:4px;font-weight:600;">${token}</span>`;
    }

    if (/^\d+(?:\.\d+)?(?:%|percent|million|billion|thousand|k|m|b)?$/i.test(cleanWord)) {
      return `<span style="background-color:#c1deff;color:#275377;padding:2px 4px;border-radius:4px;font-weight:600;">${token}</span>`;
    }
    if (safeActionWords.some(w => w.toLowerCase() === cleanWord)) {
      return `<span style="background-color:#d1fae5;color:#065f46;padding:2px 4px;border-radius:4px;font-weight:600;">${token}</span>`;
    }

    return token;
  }).join('');
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}



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
                    <Typography sx={{ fontWeight: 600, color: getColor(score), fontFamily: 'Satoshi Bold' }}>
                        {getLabel(score)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: '#6b7280', fontFamily: 'DM Sans' }}>
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
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${color} 0%, ${color}88 100%)`,
                    borderRadius: '20px 20px 0 0'
                }
            }}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 2
            }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color,
                        boxShadow: `0 4px 16px ${color}20`
                    }}
                >
                    <Icon sx={{ fontSize: 28 }} />
                </Box>

                <Box>
                    <Typography sx={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: '#1f2937',
                        fontFamily: 'Satoshi Black',
                        lineHeight: 1,
                        mb: 0.5
                    }}>
                        {value}
                    </Typography>
                    <Typography sx={{
                        fontSize: '0.9rem',
                        color: '#6b7280',
                        fontFamily: 'DM Sans Medium',
                        fontWeight: 500,
                        letterSpacing: '0.025em'
                    }}>
                        {label}
                    </Typography>
                </Box>
            </Box>

            {subtitle && (
                <Typography sx={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    fontFamily: 'DM Sans',
                    textAlign: 'center',
                    mt: 1
                }}>
                    {subtitle}
                </Typography>
            )}

            {/* Subtle background decoration */}
            <Box sx={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
                zIndex: 0
            }} />
        </Card>
    );


    // If detailed results haven't been shown yet, show the Interview Complete screen
    if (!showDetailedResults) {
        return (
            <InterviewCompleteScreen
                overallScore={overallScore}
                totalQuestions={totalQuestions}
                totalAverageRecordedTime={totalAverageRecordedTime}
                questionData={questionData}
                overallTips={overallTips}
                onViewDetails={() => setShowDetailedResults(true)}
            />
        );
    }

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <DefaultAppLayout  elevation={16} title="Interview Results" color="#2850d9" titlecolor="#FFFFFF">
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


                            {/* Back to Complete Screen Button */}
                            <motion.div variants={itemVariants}>
                                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowDetailedResults(false)}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: '50px',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            fontFamily: 'Satoshi Medium',
                                            background: 'white',
                                            color: '#374151',
                                            border: '2px solid #e5e7eb',
                                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        ← Back to Summary
                                    </motion.button>
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 2,
                                        flexWrap: 'wrap'
                                    }}>
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => router.push('/behavioral')}
                                            style={{
                                                padding: '12px 24px',
                                                borderRadius: '50px',
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                                fontFamily: 'Satoshi Medium',
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
                                                padding: '12px 24px',
                                                borderRadius: '50px',
                                                fontWeight: 600,
                                                fontSize: '0.95rem',
                                                fontFamily: 'Satoshi Medium',
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
                                </Box>
                            </motion.div>

                            {/* Unified Tabs and Content Component */}
                            <motion.div variants={itemVariants}>
                                <Card sx={{
                                    mb: 3,
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                                }}>
                                    {/* Tabs Header */}
                                    <Tabs
                                        value={selectedQuestion - 1}
                                        onChange={(event, newValue) => setSelectedQuestion(newValue + 1)}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        sx={{
                                            borderBottom: '1px solid #e5e7eb',
                                            '& .MuiTabs-indicator': {
                                                backgroundColor: '#3b82f6',
                                                height: 3
                                            },
                                            '& .MuiTab-root': {
                                                minWidth: 120,
                                                fontFamily: 'Satoshi Medium',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                textTransform: 'none',
                                                '&.Mui-selected': {
                                                    color: '#3b82f6'
                                                }
                                            }
                                        }}
                                    >
                                        {Object.keys(questionData).map((qNum) => (
                                            <Tab
                                                key={qNum}
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <span>Question {qNum}</span>
                                                        <Chip
                                                            label={questionData[qNum].score}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.7rem',
                                                                backgroundColor: questionData[qNum].score >= 85 ? '#d1fae5' :
                                                                               questionData[qNum].score >= 70 ? '#fef3c7' : '#fee2e2',
                                                                color: questionData[qNum].score >= 85 ? '#065f46' :
                                                                       questionData[qNum].score >= 70 ? '#92400e' : '#991b1b',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Box>
                                                }
                                            />
                                        ))}
                                    </Tabs>

                                    {/* Tab Content */}
                                    <Box sx={{ p: 3 }}>
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={selectedQuestion}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {/* Two Column Layout: Question + Statistics */}
                                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                                    {/* Left Column: Question */}
                                                    <Grid item xs={12} md={8}>
                                                        <Box>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                                                {currentData.questionTypes?.map((type, index) => {
                                                                    const colors = [
                                                                        { bg: '#e0f2fe', text: '#0277bd', border: '#81d4fa' }, // Blue
                                                                        { bg: '#f3e8ff', text: '#7c3aed', border: '#c4b5fd' }, // Purple
                                                                        { bg: '#dcfce7', text: '#16a34a', border: '#86efac' }, // Green
                                                                        { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' }, // Yellow
                                                                        { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' }, // Red
                                                                        { bg: '#f0f9ff', text: '#0284c7', border: '#7dd3fc' }, // Sky
                                                                        { bg: '#fdf4ff', text: '#c026d3', border: '#f0abfc' }, // Fuchsia
                                                                        { bg: '#ecfdf5', text: '#059669', border: '#6ee7b7' }  // Emerald
                                                                    ];
                                                                    const colorSet = colors[index % colors.length];
                                                                    return (
                                                                        <Chip
                                                                            key={index}
                                                                            label={type}
                                                                            size="small"
                                                                            sx={{
                                                                                backgroundColor: colorSet.bg,
                                                                                color: colorSet.text,
                                                                                fontWeight: 600,
                                                                                fontSize: '0.75rem',
                                                                                fontFamily: 'Satoshi Medium',
                                                                                border: `1px solid ${colorSet.border}`
                                                                            }}
                                                                        />
                                                                    );
                                                                }) || []}
                                                            </Box>
                                                            <Typography sx={{
                                                                fontSize: '1.5rem',
                                                                fontWeight: 900,
                                                                color: '#1f2937',
                                                                fontFamily: 'Satoshi Black',
                                                                lineHeight: 1.5,
                                                                letterSpacing: '-0.02em'
                                                            }}>
                                                                {currentData.question}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>

                                                    {/* Right Column: Performance Score */}
                                                    <Grid item xs={12} md={4}>
                                                        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                                                            <PerformanceIndicator score={currentData.score} />
                                                        </Box>
                                                    </Grid>
                                                </Grid>

                                                {/* Statistics Grid */}
                                                <Grid container spacing={2} sx={{ mb: 4 }}>
                                                    <Grid item xs={6} sm={3}>
                                                        <MetricCard
                                                            icon={AccessTimeIcon}
                                                            label="Time"
                                                            value={(() => {
                                                                const totalSeconds = recordedTimes[selectedQuestion - 1]?.recordedTime || 0;
                                                                const minutes = Math.floor(totalSeconds / 60);
                                                                const seconds = String(totalSeconds % 60).padStart(2, '0');
                                                                return `${minutes}:${seconds}`;
                                                            })()}
                                                            color="#8b5cf6"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6} sm={3}>
                                                        <MetricCard
                                                            icon={RecordVoiceOverIcon}
                                                            label="Word Count"
                                                            value={currentData.wordCount}
                                                            color="#f59e0b"
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
                                                            color="#06b6d4"
                                                        />
                                                    </Grid>
                                                </Grid>

                                                {/* Response Section */}
                                                <Box sx={{ mb: 4 }}>
                                                    <div className="tabContainerStyle">
                                                        <button
                                                        style={tabStyle(activeTab === 0)}
                                                        onClick={() => setActiveTab(0)}
                                                        >
                                                        📝 Your Response
                                                        </button>
                                                        <button
                                                        style={tabStyle(activeTab === 1)}
                                                        onClick={() => setActiveTab(1)}
                                                        >
                                                        ✨ Improved Response
                                                        </button>
                                                    </div>
                                                    {/* Tab Content */}
                                                    {activeTab === 0 && (
                                                        <div>
                                                        <div style={contentBoxStyle}>
                                                            <div
                                                            style={textStyle}
                                                            dangerouslySetInnerHTML={{
                                                                __html: highlightText(
                                                                currentData.transcript,
                                                                currentData.fillerWordsList,
                                                                currentData.actionWordsList,
                                                                currentData.starAnswerParsed
                                                                )
                                                            }}
                                                            />
                                                        </div>

                                                        {/* Legend */}
                                                        <div style={legendStyle}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px', color: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                            Highlight Legend:
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                            <div style={legendItemStyle}>
                                                                <div style={colorBoxStyle('#d1fae5', '#a7f3d0')} />
                                                                <span style={{ fontSize: '0.75rem', color: '#065f46', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                                Action Words
                                                                </span>
                                                            </div>
                                                            <div style={legendItemStyle}>
                                                                <div style={colorBoxStyle('#C7DDFC', '#6ea7e4ff')} />
                                                                <span style={{ fontSize: '0.75rem', color: '#325274', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                                Numbers/Stats
                                                                </span>
                                                            </div>
                                                            <div style={legendItemStyle}>
                                                                <div style={colorBoxStyle('#ffd9d9ff', '#fca8a8ff')} />
                                                                <span style={{ fontSize: '0.75rem', color: '#dc2626', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                                                Filler Words
                                                                </span>
                                                            </div>

                                                            <div style={{ fontSize: '0.8rem', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '600' }}>
                                                                <span style={{ color: 'black', borderBottom: '3px solid #FBBF24' }}>Situation </span>
                                                                <span style={{ color: 'black', borderBottom: '3px solid #3B82F6' }}>Task </span>
                                                                <span style={{ color: 'black', borderBottom: '3px solid #FB923C' }}>Action </span>
                                                                <span style={{ color: 'black', borderBottom: '3px solid #8B5CF6' }}>Result </span>
                                                            </div>
                                                            </div>
                                                        </div>
                                                        </div>
                                                    )}

                                                    {activeTab === 1 && (
                                                        <div style={contentBoxStyle}>
                                                        <div
                                                            style={textStyle}
                                                            dangerouslySetInnerHTML={{
                                                            __html: currentData.improvedResponse
                                                            }}
                                                        />
                                                        </div>
                                                    )}
                                                </Box>

                                                {/* Advice Section */}
                                                <Grid container spacing={3}>
                                                    {/* Strengths */}
                                                    <Grid item xs={12} md={6}>
                                                        <Box sx={{
                                                            p: 3,
                                                            borderRadius: '20px',
                                                            background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
                                                            border: '1px solid #bae6fd',
                                                            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.1)',
                                                            height: '100%',
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            '&::before': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                height: '4px',
                                                                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                                                                borderRadius: '20px 20px 0 0'
                                                            }
                                                        }}>
                                                            {/* Background decoration */}
                                                            <Box sx={{
                                                                position: 'absolute',
                                                                top: -20,
                                                                right: -20,
                                                                width: 80,
                                                                height: 80,
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #10b98120 0%, #34d39915 100%)',
                                                                zIndex: 0
                                                            }} />

                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, position: 'relative', zIndex: 1 }}>
                                                                <Box sx={{
                                                                    width: 48,
                                                                    height: 48,
                                                                    borderRadius: '12px',
                                                                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                                                    color: 'white'
                                                                }}>
                                                                    <CheckCircleIcon sx={{ fontSize: 24 }} />
                                                                </Box>
                                                                <Typography sx={{
                                                                    fontSize: '1.25rem',
                                                                    fontWeight: 700,
                                                                    color: '#1f2937',
                                                                    fontFamily: 'Satoshi Bold'
                                                                }}>
                                                                    What You Did Well
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
                                                                {currentData.strengths.map((strength, index) => (
                                                                    <Box key={index} sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'flex-start',
                                                                        gap: 2,
                                                                        p: 2,
                                                                        background: 'rgba(255, 255, 255, 0.7)',
                                                                        borderRadius: '12px',
                                                                        border: '1px solid rgba(16, 185, 129, 0.1)'
                                                                    }}>
                                                                        <Box sx={{
                                                                            width: 20,
                                                                            height: 20,
                                                                            borderRadius: '50%',
                                                                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            mt: 0.25,
                                                                            flexShrink: 0
                                                                        }}>
                                                                            <CheckCircleIcon sx={{ fontSize: 12, color: 'white' }} />
                                                                        </Box>
                                                                        <Typography sx={{
                                                                            fontSize: '0.9rem',
                                                                            color: '#374151',
                                                                            lineHeight: 1.5,
                                                                            fontFamily: 'DM Sans Medium',
                                                                            fontWeight: 500
                                                                        }}>
                                                                            {strength}
                                                                        </Typography>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                   {/* Tips & Advice */}
                                                    <Grid item xs={12} md={6}>
                                                        <Box sx={{
                                                            p: 3,
                                                            borderRadius: '20px',
                                                            background: 'linear-gradient(145deg, #fef7ff 0%, #faf5ff 100%)',
                                                            border: '1px solid #e9d5ff',
                                                            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.1)',
                                                            height: '100%',
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            '&::before': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                height: '4px',
                                                                background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)',
                                                                borderRadius: '20px 20px 0 0'
                                                            }
                                                        }}>
                                                            {/* Background decoration */}
                                                            <Box sx={{
                                                                position: 'absolute',
                                                                top: -20,
                                                                right: -20,
                                                                width: 80,
                                                                height: 80,
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #8b5cf620 0%, #a78bfa15 100%)',
                                                                zIndex: 0
                                                            }} />

                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, position: 'relative', zIndex: 1 }}>
                                                                <Box sx={{
                                                                    width: 48,
                                                                    height: 48,
                                                                    borderRadius: '12px',
                                                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                                                                    color: 'white',
                                                                    fontSize: '1.5rem'
                                                                }}>
                                                                    💡
                                                                </Box>
                                                                <Typography sx={{
                                                                    fontSize: '1.25rem',
                                                                    fontWeight: 700,
                                                                    color: '#1f2937',
                                                                    fontFamily: 'Satoshi Bold'
                                                                }}>
                                                                    Tips & Advice
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
                                                                {currentData.tips.map((tip, index) => (
                                                                    <Box key={index} sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'flex-start',
                                                                        gap: 2,
                                                                        p: 3,
                                                                        background: 'rgba(255, 255, 255, 0.8)',
                                                                        borderRadius: '12px',
                                                                        border: '1px solid rgba(139, 92, 246, 0.1)'
                                                                    }}>
                                                                        <Box sx={{
                                                                            width: 24,
                                                                            height: 24,
                                                                            borderRadius: '50%',
                                                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            mt: 0.25,
                                                                            flexShrink: 0,
                                                                            fontSize: '0.75rem'
                                                                        }}>
                                                                            💡
                                                                        </Box>
                                                                        <Typography sx={{
                                                                            fontSize: '0.9rem',
                                                                            color: '#374151',
                                                                            lineHeight: 1.6,
                                                                            fontFamily: 'DM Sans Medium',
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
                                            </motion.div>
                                        </AnimatePresence>
                                    </Box>
                                </Card>
                            </motion.div>

                            {/* Navigation Arrows */}
                            <motion.div variants={itemVariants}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    mt: 4
                                }}>
                                    <motion.button
                                        whileHover={{ scale: 1.05, x: -3 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            if (selectedQuestion > 1) {
                                                setSelectedQuestion(selectedQuestion - 1);
                                                setTimeout(() => {
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    document.documentElement.scrollTop = 0;
                                                }, 0);
                                            }
                                        }}
                                        disabled={selectedQuestion === 1}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: '50px',
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            fontFamily: 'Satoshi Medium',
                                            background: selectedQuestion === 1 ? '#e5e7eb' : 'white',
                                            color: selectedQuestion === 1 ? '#9ca3af' : '#374151',
                                            border: '2px solid #d1d5db',
                                            boxShadow: selectedQuestion === 1 ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.1)',
                                            cursor: selectedQuestion === 1 ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        ← Previous
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05, x: 3 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            const totalQuestions = Object.keys(questionData).length;
                                            if (selectedQuestion < totalQuestions) {
                                                setSelectedQuestion(selectedQuestion + 1);
                                                setTimeout(() => {
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    document.documentElement.scrollTop = 0;
                                                }, 0);
                                            }
                                        }}
                                        disabled={selectedQuestion === Object.keys(questionData).length}
                                        style={{
                                            padding: '12px 24px',
                                            borderRadius: '50px',
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            fontFamily: 'Satoshi Medium',
                                            background: selectedQuestion === Object.keys(questionData).length ? '#e5e7eb' : 'white',
                                            color: selectedQuestion === Object.keys(questionData).length ? '#9ca3af' : '#374151',
                                            border: '2px solid #d1d5db',
                                            boxShadow: selectedQuestion === Object.keys(questionData).length ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.1)',
                                            cursor: selectedQuestion === Object.keys(questionData).length ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        Next →
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