// "use client";
//
// import CssBaseline from "@mui/material/CssBaseline";
// import MainAppBar from "../../../../../components/MainAppBar";
// import LeftNavbar from "../../../../../components/LeftNavbar";
// import React, { useEffect, useState } from "react";
// import { SignedIn } from "@clerk/nextjs";
// import { Box, Typography, CircularProgress } from "@mui/material";
// import Toolbar from "@mui/material/Toolbar";
// import Link from "next/link";
// import { AnimatePresence, motion } from "framer-motion";
// import { useSearchParams } from "next/navigation";
// import { getTranscriptContentForQuestion } from "./FeedbackTabs";
//
// export default function InterviewResults() {
//     const [selectedTab, setSelectedTab] = useState(null);
//     const [questionNumber, setQuestionNumber] = useState(null);
//     const [questions, setQuestions] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [interviewData, setInterviewData] = useState(null);
//     const [tabs, setTabs] = useState([
//         {
//             icon: "📊",
//             label: "Statistics",
//             content: "<div class='text-left'><p>Interview analytics will appear here</p></div>"
//         },
//         {
//             icon: "💡",
//             label: "Advice",
//             content: "<div class='text-left'><p>Personalized feedback will appear here</p></div>"
//         },
//         {
//             icon: "📜",
//             label: "Transcript",
//             content: "<div class='text-left'><p>Loading your interview transcript...</p></div>"
//         }
//     ]);
//
//     const searchParams = useSearchParams();
//     // Try to get from URL first, then fallback to sessionStorage
//     const sessionId = searchParams.get('sessionId') || sessionStorage.getItem("interviewSessionId");
//
//     // Fetch interview results from backend
//     const fetchInterviewResults = async () => {
//         try {
//             if (!sessionId) throw new Error('No session ID provided');
//             console.log("Fetching results for session:", sessionId);
//
//             const response = await fetch(
//                 `http://127.0.0.1:5000/get-all-responses/${sessionId}`
//             );
//             const data = await response.json();
//             console.log("fetched data:", data); // Debugging
//
//             if (!response.ok) throw new Error('Failed to fetch results');
//             return data;
//         } catch (err) {
//             console.error("Fetch error:", err);
//             setError(err.message);
//             return null;
//         }
//     };
//
//     // Update transcript tab content
//     const updateTranscriptTab = async (specificQuestion = null) => {
//         try {
//             setIsLoading(true);
//             const result = await getTranscriptContentForQuestion(
//                 specificQuestion,
//                 sessionId
//             );
//
//             // Update the transcript tab with new content
//             setTabs(currentTabs =>
//                 currentTabs.map(tab =>
//                     tab.label === "Transcript"
//                         ? { ...tab, content: result.html }
//                         : tab
//                 )
//             );
//
//             setIsLoading(false);
//             return result;
//         } catch (err) {
//             console.error("Error updating transcript tab:", err);
//             setIsLoading(false);
//             return { html: "<p>Error loading transcript data</p>", data: null };
//         }
//     };
//
//     // Update statistics tab with filler word analytics
//     const updateStatisticsTab = (responses) => {
//         if (!responses || Object.keys(responses).length === 0) {
//             return;
//         }
//
//         // Collect all filler words
//         let allFillerWords = [];
//         let fillerWordsPerQuestion = {};
//         let totalWords = 0;
//         let totalResponseLength = 0;
//
//         Object.entries(responses).forEach(([questionNum, response]) => {
//             const fillerWords = response.filler_words || [];
//             allFillerWords = [...allFillerWords, ...fillerWords];
//
//             // Count words in transcript
//             const wordCount = response.transcript ? response.transcript.split(/\s+/).length : 0;
//             totalWords += wordCount;
//             totalResponseLength += response.transcript ? response.transcript.length : 0;
//
//             fillerWordsPerQuestion[questionNum] = fillerWords.length;
//         });
//
//         // Calculate statistics
//         const totalFillerWords = allFillerWords.length;
//         const fillerWordPercentage = totalWords ? ((totalFillerWords / totalWords) * 100).toFixed(1) : 0;
//         const averageResponseLength = Object.keys(responses).length ?
//             (totalResponseLength / Object.keys(responses).length).toFixed(0) : 0;
//
//         // Common filler words distribution
//         const fillerWordCounts = {};
//         allFillerWords.forEach(word => {
//             fillerWordCounts[word] = (fillerWordCounts[word] || 0) + 1;
//         });
//
//         // Sort by frequency
//         const sortedFillerWords = Object.entries(fillerWordCounts)
//             .sort((a, b) => b[1] - a[1])
//             .slice(0, 5); // Top 5
//
//         const statsContent = `
//             <div class='text-left'>
//                 <h3 class="text-2xl font-bold mb-4">Interview Statistics</h3>
//
//                 <div class="mb-6">
//                     <p class="text-xl font-semibold mb-2">Overall</p>
//                     <p><strong>Total questions answered:</strong> ${Object.keys(responses).length}</p>
//                     <p><strong>Average response length:</strong> ~${averageResponseLength} characters</p>
//                     <p><strong>Total filler words used:</strong> ${totalFillerWords} (${fillerWordPercentage}% of your speech)</p>
//                 </div>
//
//                 ${sortedFillerWords.length > 0 ? `
//                 <div class="mb-6">
//                     <p class="text-xl font-semibold mb-2">Top Filler Words</p>
//                     <ul class="list-disc pl-5">
//                         ${sortedFillerWords.map(([word, count]) =>
//                             `<li><strong>${word}:</strong> ${count} times</li>`
//                         ).join('')}
//                     </ul>
//                 </div>
//                 ` : ''}
//
//                 <div class="mb-6">
//                     <p class="text-xl font-semibold mb-2">Filler Words By Question</p>
//                     <ul class="list-disc pl-5">
//                         ${Object.entries(fillerWordsPerQuestion).map(([questionNum, count]) =>
//                             `<li><strong>Question ${questionNum}:</strong> ${count} filler words</li>`
//                         ).join('')}
//                     </ul>
//                 </div>
//             </div>
//         `;
//
//         // Update the statistics tab
//         setTabs(currentTabs =>
//             currentTabs.map(tab =>
//                 tab.label === "Statistics"
//                     ? { ...tab, content: statsContent }
//                     : tab
//             )
//         );
//     };
//
//     // Generate feedback for the Advice tab
//     const generateAdviceTab = (responses) => {
//         if (!responses || Object.keys(responses).length === 0) {
//             return;
//         }
//
//         const adviceContent = `
//             <div class='text-left'>
//                 <h3 class="text-2xl font-bold mb-4">Interview Feedback</h3>
//
//                 <div class="mb-6">
//                     <p class="text-xl font-semibold mb-2">Communication Style</p>
//                     <ul class="list-disc pl-5">
//                         <li>Focus on reducing filler words like "um" and "uh" to sound more confident.</li>
//                         <li>Try practicing the STAR method (Situation, Task, Action, Result) for structured responses.</li>
//                         <li>Record yourself answering practice questions to become aware of speech patterns.</li>
//                     </ul>
//                 </div>
//
//                 <div class="mb-6">
//                     <p class="text-xl font-semibold mb-2">Content Improvement</p>
//                     <ul class="list-disc pl-5">
//                         <li>Include specific metrics and outcomes when describing your achievements.</li>
//                         <li>Keep your answers concise while still providing sufficient detail.</li>
//                         <li>Practice transitioning smoothly between different parts of your answer.</li>
//                     </ul>
//                 </div>
//
//                 <div class="mb-6">
//                     <p class="text-xl font-semibold mb-2">Next Steps</p>
//                     <p>Schedule another practice interview focusing on the feedback above. Try to reduce filler words by at least 25% in your next session.</p>
//                 </div>
//             </div>
//         `;
//
//         // Update the advice tab
//         setTabs(currentTabs =>
//             currentTabs.map(tab =>
//                 tab.label === "Advice"
//                     ? { ...tab, content: adviceContent }
//                     : tab
//             )
//         );
//     };
//
//     // Load data on mount
//     useEffect(() => {
//         const loadResults = async () => {
//             setIsLoading(true);
//
//             if (!sessionId) {
//                 setError("No session ID found. Please complete an interview first.");
//                 setIsLoading(false);
//                 return;
//             }
//
//             // Log session ID to verify it's correctly passed
//             console.log("Using session ID for results:", sessionId);
//
//             // Fetch all results
//             const result = await fetchInterviewResults();
//
//             if (result && result.success && result.responses) {
//                 setInterviewData(result);
//
//                 // Extract questions from the response data
//                 const questionsList = Object.entries(result.responses).map(([num, response]) => ({
//                     number: num,
//                     text: response.question_text || `Question ${num}`
//                 }));
//
//                 // Sort questions by number
//                 questionsList.sort((a, b) => parseInt(a.number) - parseInt(b.number));
//                 setQuestions(questionsList);
//
//                 console.log("Found questions:", questionsList.map(q => q.number));
//
//                 // Update all tabs with data
//                 const transcriptResult = await updateTranscriptTab();
//                 updateStatisticsTab(result.responses);
//                 generateAdviceTab(result.responses);
//
//                 // Select transcript tab by default
//                 setSelectedTab(tabs.find(tab => tab.label === "Transcript"));
//                 setIsLoading(false);
//             } else {
//                 setError("No interview data found or error retrieving data");
//                 setIsLoading(false);
//             }
//         };
//
//         loadResults();
//     }, [sessionId]);
//
//     // Effect to initialize selectedTab after tabs are updated
//     useEffect(() => {
//         if (!selectedTab && tabs.length > 0) {
//             setSelectedTab(tabs.find(tab => tab.label === "Transcript") || tabs[0]);
//         }
//     }, [tabs, selectedTab]);
//
//     // Handle question selection
//     const handleQuestionSelect = async (number) => {
//         setIsLoading(true);
//         setQuestionNumber(number);
//
//         await updateTranscriptTab(number);
//
//         setIsLoading(false);
//     };
//
//     // Handle "All Questions" button
//     const handleViewAllQuestions = async () => {
//         setIsLoading(true);
//         setQuestionNumber(null);
//         await updateTranscriptTab();
//         setIsLoading(false);
//     };
//
//     // Question button component
//     const QuestionButton = ({ number, text }) => (
//         <button
//             className={`
//                 rounded-2xl bg-gradient-to-r
//                 ${questionNumber === number ? 'from-color307999 to-color6EAFCC' : 'from-color6BAEDB to-colorACD9DB'}
//                 w-full text-color282523 font-satoshi font-bold shadow-[0_9px_#1d3557]
//                 text-black text-xl px-6 py-4 hover:from-color307999
//                 hover:to-color6EAFCC active:bg-color7DBE73
//                 active:shadow-[0_5px_#1d3557] active:translate-y-1 focus:outline-none
//             `}
//             onClick={() => handleQuestionSelect(number)}
//         >
//             {`Question ${number}`}
//         </button>
//     );
//
//     return (
//         <SignedIn>
//             <Box sx={{ display: "flex" }}>
//                 <CssBaseline />
//                 <MainAppBar title="Behavioral Interview Simulation" color="#2850d9" />
//                 <LeftNavbar />
//
//                 <Box component="main" sx={{ flexGrow: 1, bgcolor: '#F3F1EB', p: 4.5, height: '100vh', overflow: 'auto' }}>
//                     <Toolbar />
//                     <Box>
//                         <Typography color={"black"} fontFamily={"Satoshi Bold"} fontSize={"1.7rem"}>
//                             Interview Results Summary
//                         </Typography>
//                         <Typography color={"black"} fontFamily={"DM Sans"} fontSize={"1rem"}>
//                             Review your interview performance and transcripts below.
//                         </Typography>
//                     </Box>
//
//                     <div className="flex flex-row justify-between w-full">
//                         {/* Questions Panel */}
//                         <Box className="w-[34%] pt-5 flex flex-col justify-between">
//                             <div className="flex flex-col space-y-5">
//                                 {isLoading && !questions.length ? (
//                                     <div className="flex justify-center py-10">
//                                         <CircularProgress />
//                                     </div>
//                                 ) : error && !questions.length ? (
//                                     <div className="text-red-500 p-4 bg-white rounded-lg shadow">
//                                         <p>{error}</p>
//                                         <p className="mt-2">Try completing an interview first.</p>
//                                     </div>
//                                 ) : questions.length > 0 ? (
//                                     <>
//                                         <button
//                                             className={`
//                                                 rounded-2xl bg-gradient-to-r
//                                                 ${!questionNumber ? 'from-color307999 to-color6EAFCC' : 'from-[#98D781] to-[#6BC26B]'}
//                                                 w-full text-color282523 font-satoshi font-bold shadow-[0_9px_#1d3557]
//                                                 text-black text-xl px-6 py-4 hover:from-color307999
//                                                 hover:to-color6EAFCC active:bg-color7DBE73
//                                                 active:shadow-[0_5px_#1d3557] active:translate-y-1 focus:outline-none
//                                             `}
//                                             onClick={handleViewAllQuestions}
//                                         >
//                                             All Questions
//                                         </button>
//                                         {questions.map(q => (
//                                             <QuestionButton key={q.number} number={q.number} text={q.text} />
//                                         ))}
//                                     </>
//                                 ) : (
//                                     <div className="p-4 bg-white rounded-lg shadow">
//                                         <p>No questions found. Try completing an interview first.</p>
//                                     </div>
//                                 )}
//                             </div>
//
//                             <div className='group flex justify-center items-center mt-8'>
//                                 <Link href='/dashboard' className="bg-gradient-to-r from-[#98D781] to-[#7A9BE2] text-2xl font-dm-sans tracking-tight bg-colorFAF8F1 text-color282523 py-2 px-6 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-105 group-hover:-rotate-2">
//                                     <span className='font-satoshi text-center text-2xl'>Dashboard</span>
//                                     <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                         <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7" />
//                                     </svg>
//                                 </Link>
//                             </div>
//                         </Box>
//
//                         {/* Content Panel */}
//                         <div className="w-[65%] flex flex-col space-y-3 pt-5">
//                             <div className="p-5 pt-5 rounded-3xl" style={{backgroundColor: "#D9D7D1"}}>
//                                 <h2 className="text-color282523 font-satoshi text-2xl">
//                                     {questionNumber ? `Question ${questionNumber}` : "All Questions"}
//                                 </h2>
//
//                                 <div className="w-120 h-200 rounded-2xl overflow-hidden shadow">
//                                     <nav className="font-dm-sans text-color282523 tracking-tight rounded-t-xl" style={{textAlign: "center"}}>
//                                         <ul className="flex w-full space-x-1.5">
//                                             {tabs.map((item) => (
//                                                 <li
//                                                     key={item.label}
//                                                     className={`flex-1 min-w-0 p-3 relative cursor-pointer rounded-t-xl justify-between items-center font-bold text-xl ${
//                                                         selectedTab?.label === item.label
//                                                             ? "bg-colorF3F1EA text-color6998C2"
//                                                             : "bg-colorB0B0B0"
//                                                     }`}
//                                                     onClick={() => setSelectedTab(item)}
//                                                 >
//                                                     {`${item.icon} ${item.label}`}
//                                                     {selectedTab?.label === item.label && (
//                                                         <motion.div
//                                                             className="absolute bottom-0 left-0 right-0 h-0.5 bg-colorB7B7B7"
//                                                             layoutId="underline"
//                                                         />
//                                                     )}
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     </nav>
//
//                                     <main className="flex justify-center h-[600px] flex-grow text-base" style={{backgroundColor: "#F3F1EA"}}>
//                                         <AnimatePresence mode="wait">
//                                             {selectedTab && (
//                                                 <motion.div
//                                                     key={selectedTab.label}
//                                                     initial={{ y: 10, opacity: 0 }}
//                                                     animate={{ y: 0, opacity: 1 }}
//                                                     exit={{ y: -10, opacity: 0 }}
//                                                     transition={{ duration: 0.12 }}
//                                                     className="overflow-y-auto w-full"
//                                                 >
//                                                     {isLoading ? (
//                                                         <div className="flex justify-center items-center h-full">
//                                                             <CircularProgress />
//                                                         </div>
//                                                     ) : error ? (
//                                                         <div className="text-red-500 p-8">
//                                                             Error: {error}
//                                                         </div>
//                                                     ) : (
//                                                         <div
//                                                             className="text-color282523 p-8 w-full"
//                                                             style={{fontSize: "18px", fontFamily: "DM Sans"}}
//                                                             dangerouslySetInnerHTML={{
//                                                                 __html: selectedTab.content
//                                                             }}
//                                                         />
//                                                     )}
//                                                 </motion.div>
//                                             )}
//                                         </AnimatePresence>
//                                     </main>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </Box>
//             </Box>
//         </SignedIn>
//     );
// }