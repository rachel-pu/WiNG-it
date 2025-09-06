"use client";

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import StopIcon from "@mui/icons-material/Stop";
import Button from "@mui/material/Button";
import TalkingInterviewer from "./TalkingInterviewer";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import {CircularProgress, Typography, Snackbar, Alert, Avatar, Fade} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PinDropIcon from "@mui/icons-material/PinDrop";
import { getFunctions, httpsCallable } from "firebase/functions";

const InterviewQuestions = ({questions, showTimer}) => {
    const router = useRouter();
    const containerRef = useRef(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [transcript, setTranscript] = useState("");
    const audioRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("info");
    const [showAlert, setShowAlert] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [recordTime, setRecordTime] = useState(0); 
    const [recordInterval, setRecordInterval] = useState(null);


    const videoRef = useRef(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [videoActive, setVideoActive] = useState(false);

    // Media recorder objects
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    // Generate a session ID when the component mounts
    useEffect(() => {
        const newSessionId = `session-${Date.now()}`;
        setSessionId(newSessionId);
        console.log("Interview session ID:", newSessionId);
    }, []);

    // Auto-hide alert after 5 seconds
    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    // Webcam stream setup
    const handleToggleVideo = async () => {
        if (videoActive) {
            mediaStream.getTracks().forEach((t) => t.stop());
            setMediaStream(null);
            setVideoActive(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setMediaStream(stream);
                setVideoActive(true);
            } catch (err) {
                console.error("Error accessing video:", err);
                setVideoActive(false);
            }
        }
    };

    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [videoRef, mediaStream]);

    // Cleanup function
    useEffect(() => {
        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };
    }, [mediaStream]);

    // Fetch TTS audio for the current question
    const fetchAndPlayQuestionAudio = async (text) => {
        try {

            const response = await fetch("https://us-central1-wing-it-e6a3a.cloudfunctions.net/textToSpeech", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({text})
            });

            if (!response.ok) {
                console.error("Error fetching audio:", response.status);
                return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            setTimeout(() => setShowAlert(false), 2000);
        } catch (error) {
            console.error("Error in text-to-speech fetch:", error);
        }
    };

    // When a new question loads, fetch its audio
    useEffect(() => {
        if (questions.length && currentQuestionIndex < questions.length) {
            fetchAndPlayQuestionAudio(questions[currentQuestionIndex]);
        }
    }, [currentQuestionIndex, questions]);

    // When the audio URL is updated, load and play the audio
    useEffect(() => {
        const audio = audioRef.current;
        if (audio && audioUrl) {
            const handlePlay = () => setIsSpeaking(true);
            const handleEnded = () => setIsSpeaking(false);

            audio.src = audioUrl;
            audio.addEventListener("play", handlePlay);
            audio.addEventListener("ended", handleEnded);

            audio.load();
            audio.play().catch((err) => {
                console.error("Autoplay failed:", err);
                setAlertMessage("Failed to play audio automatically. Please click to play.");
                setAlertSeverity("warning");
                setShowAlert(true);
            });

            return () => {
                audio.removeEventListener("play", handlePlay);
                audio.removeEventListener("ended", handleEnded);
            };
        }
    }, [audioUrl]);

    // Set up recording functionality
    useEffect(() => {
        const setupRecording = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({audio: true});
                mediaRecorder.current = new MediaRecorder(stream);

                mediaRecorder.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunks.current.push(event.data);
                    }
                };

                mediaRecorder.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunks.current, {type: 'audio/wav'});
                    audioChunks.current = [];
                    await processAudioBlob(audioBlob);
                };

                console.log("Audio recording initialized successfully");
            } catch (error) {
                console.error("Error setting up audio recording:", error);
                setAlertMessage("Failed to set up audio recording. Please check microphone permissions.");
                setAlertSeverity("error");
                setShowAlert(true);
            }
        };

        setupRecording();
    }, []);

    const startRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'inactive') {
            const questionIndexAtRecordingStart = currentQuestionIndex;
            audioChunks.current = [];
            mediaRecorder.current.start();
            setIsRecording(true);
            console.log("Recording started");

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, {type: 'audio/wav'});
                audioChunks.current = [];
                await processAudioBlob(audioBlob, questionIndexAtRecordingStart);
            };

            if (showTimer) {
                setRecordTime(0);
                const interval = setInterval(() => {
                    setRecordTime(prev => prev + 1);
                }, 1000);
                setRecordInterval(interval);
            }
            

            setAlertMessage("Recording started");
            setAlertSeverity("info");
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 1500);
        } else {
            console.error("MediaRecorder not initialized or already recording");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
            console.log("Recording stopped");

             if (recordInterval) {
                clearInterval(recordInterval);
                setRecordInterval(null);
            }

            setAlertMessage("Processing your answer...");
            setAlertSeverity("info");
            setShowAlert(true);
        }
    };

    const processAudioBlob = async (audioBlob, questionIndexAtRecordingStart) => {
    try {
        // Convert audio blob to base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(
            String.fromCharCode(...new Uint8Array(arrayBuffer))
        );

        // Prepare JSON payload
        const payload = {
            sessionId,
            questionNumber: currentQuestionIndex + 1,
            questionText: questions[currentQuestionIndex],
            recordedTime: recordTime,
            audioData: base64Audio
        };

        console.log("Sending audio for transcription...");

        const response = await fetch(
            "https://us-central1-wing-it-e6a3a.cloudfunctions.net/saveResponse",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        console.log("Transcription response:", data);

        if (data.success) {
            setTranscript(data.responseData?.transcript || "");
            setHasRecorded(true);
            setIsProcessing(false);

            setAlertMessage("Answer recorded successfully!");
            setAlertSeverity("success");
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 2000);
        } else {
            throw new Error(data.error || "Unknown error");
        }

    } catch (error) {
        console.error("Error processing audio:", error);
        setIsProcessing(false);

        setAlertMessage(`Error: ${error.message}`);
        setAlertSeverity("error");
        setShowAlert(true);
    }
};


    const handleNextQuestion = () => {
        if (recordInterval) {
            clearInterval(recordInterval);
            setRecordInterval(null);
        }
        setRecordTime(0);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            const url = `/behavioral/results?sessionId=${encodeURIComponent(sessionId)}`;
            sessionStorage.setItem("interviewSessionId", sessionId);
            router.push(url);
        }
        setHasRecorded(false);
        setTranscript("");
    };

    const toggleFullscreen = () => {
        // setIsFullscreen(!isFullscreen);
        if (!document.fullscreenElement) {
            // Enter fullscreen
            containerRef.current.requestFullscreen?.()
            .then(() => setIsFullscreen(true))
            .catch((err) => console.error("Fullscreen request failed:", err));
        } else {
            // Exit fullscreen
            document.exitFullscreen?.()
            .then(() => setIsFullscreen(false))
            .catch((err) => console.error("Exit fullscreen failed:", err));
        }
    };

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'relative',
                width: {
                    xs: 'calc(100vw - 0px)',
                    sm: 'calc(100vw - 72px)',
                    md: 'calc(100vw - 240px)'
                },
                height: 'calc(100vh - 100px)',
                backgroundColor: '#1f1f23',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Zoom-like Top Bar */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                zIndex: 1000,
                backdropFilter: 'blur(10px)'
            }}>
                {/* Left side - Meeting info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontFamily: 'DM Sans',
                        fontWeight: 'bold'
                    }}>
                        Behavioral Interview
                    </Box>
                    <Typography sx={{
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        fontFamily: 'DM Sans'
                    }}>
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </Typography>
                </Box>

                {/* Right side - Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                        size="small" 
                        sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}
                        onClick={toggleFullscreen}
                    >
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>

                    
                    <IconButton 
                        size="small" 
                        sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Main video area */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '80px 20px 90px 20px',
                height: '90%',
                position: 'relative'
            }}>
                {/* Interviewer video - main */}
                <Box sx={{
                    position: 'relative',
                    backgroundColor: '#2d2d30',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: isSpeaking ? '3px solid #00ff00' : '1px solid rgba(255,255,255,0.1)',
                    transition: 'border 0.3s ease',
                    width: '100%',
                    height: '98%'
                }}>

                    {showTimer && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                backgroundColor: "rgba(0, 0, 0, 0.7)",
                                color: "white",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "1rem",
                                fontFamily: "DM Sans",
                                zIndex: 10,
                            }}
                        >
                            {Math.floor(recordTime / 60)
                                .toString()
                                .padStart(2, "0")}
                            :
                            {(recordTime % 60).toString().padStart(2, "0")}
                        </Box>
                    )}
                    {/* Name tag */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontFamily: 'DM Sans',
                        zIndex: 10
                    }}>
                        Winnie (Interviewer) {isSpeaking}
                    </Box>

                    {/* Interviewer avatar/video */}
                    <Box sx={{ 
                        width: '100%', 
                        height: '105%',
                        marginTop: '-10px',
                        '& > div': {
                            width: '100% !important',
                            height: '100% !important'
                        },
                        '& video, & img': {
                            width: '100%',
                            height: '110%',
                        
                        }
                    }}>
                        <TalkingInterviewer isTalking={isSpeaking} />
                    </Box>
                </Box>

                {/* User video - floating overlay when active */}
                {videoActive && (
                    <Box sx={{
                        position: 'absolute',
                        top: 95,
                        right: 35,
                        width: 200,
                        height: 150,
                        backgroundColor: '#2d2d30',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: isRecording ? '2px solid #30de30ff' : '1px solid rgba(255,255,255,0.1)',
                        transition: 'border 0.3s ease',
                        zIndex: 100
                    }}>
                        {/* Name tag */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontFamily: 'DM Sans',
                            zIndex: 10
                        }}>
                            You {isRecording}
                        </Box>

                        {/* User video */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                transform: 'scaleX(-1)' // Mirror effect
                            }}
                        />

                        {/* Video toggle overlay */}
                        <IconButton
                            onClick={handleToggleVideo}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                width: 24,
                                height: 24,
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                            }}
                        >
                            <VideocamOffIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                )}

                {/* Floating video toggle (when camera is off) */}
                {!videoActive && (
                    <Box sx={{
                        position: 'absolute',
                        top: 95,
                        right: 35,
                        width: 200,
                        height: 150,
                        backgroundColor: '#2d2d30',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        zIndex: 100,
                        '&:hover': { backgroundColor: '#3d3d40' }
                    }}
                    onClick={handleToggleVideo}
                    >
                        <VideocamOffIcon sx={{ color: 'white', fontSize: '2rem', mb: 1 }} />
                        <Typography sx={{ color: 'white', fontSize: '0.8rem', fontFamily: 'DM Sans' }}>
                            Start Video
                        </Typography>
                        
                        {/* Name tag */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontFamily: 'DM Sans'
                        }}>
                            You
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Transcript floating window */}
            {transcript && (
                <Box sx={{
                    position: 'absolute',
                    bottom: 110,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    maxWidth: '600px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 1000
                }}>
                    <Typography
                        variant="body2"
                        sx={{ 
                            fontFamily: 'DM Sans', 
                            fontWeight: 'bold', 
                            mb: 1, 
                            fontSize: '0.8rem',
                            color: '#adadadff'
                        }}
                    >
                        Transcript:
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            fontFamily: 'DM Sans', 
                            fontSize: '0.9rem',
                            lineHeight: 1.4
                        }}
                    >
                        {transcript}
                    </Typography>
                </Box>
            )}

            {/* Zoom-like bottom control bar */}
            <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80px',
                backgroundColor: 'rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: 2,
                zIndex: 1000,
                backdropFilter: 'blur(10px)',
                paddingTop: '22px'
            }}>
                {/* Microphone button */}
                <IconButton
                    disabled={isProcessing || hasRecorded}
                    onClick={isRecording ? stopRecording : startRecording}
                    sx={{
                        width: 56,
                        height: 56,
                        backgroundColor: isProcessing ? "#666" :
                            hasRecorded ? "#4caf50" :
                                isRecording ? "#ff4444" : "#404040",
                        color: 'white',
                        border: isRecording ? '2px solid #ff6666' : '1px solid rgba(255,255,255,0.3)',
                        "&:hover": {
                            backgroundColor: isProcessing ? "#666" :
                                hasRecorded ? "#45a049" :
                                    isRecording ? "#ff6666" : "#505050",
                        },
                        "&:disabled": {
                            backgroundColor: "#333",
                            color: "#666"
                        }
                    }}
                >
                    {isProcessing ? <CircularProgress size={24} sx={{color: 'white'}}/> :
                        isRecording ? <StopIcon /> :
                            <MicIcon />}
                </IconButton>                

                {/* Next/Finish button */}
                {hasRecorded && (
                    <Button
                        variant="contained"
                        onClick={handleNextQuestion}
                        sx={{
                            backgroundColor: '#0066cc',
                            color: 'white',
                            fontFamily: 'DM Sans',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            padding: '8px 20px',
                            borderRadius: '6px',
                            textTransform: 'none',
                            height: '56px',
                            marginLeft: 2,
                            "&:hover": {
                                backgroundColor: '#0052a3'
                            }
                        }}
                    >
                        {currentQuestionIndex < questions.length - 1 ? "Next Question" : "End Interview"}
                    </Button>
                )}
            </Box>

            {/* Hidden audio element */}
            <audio ref={audioRef} style={{display: "none"}} />

            {/* Status alerts - Fixed positioning within simulation */}
            <Fade in={showAlert} timeout={300}>
                <Box sx={{
                    position: 'absolute',
                    top: 90,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2000,
                    width: 'auto',
                    maxWidth: '90%'
                }}>
                    <Alert 
                        severity={alertSeverity} 
                        onClose={() => setShowAlert(false)}
                        sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.78)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(10px)',
                            '& .MuiAlert-icon': { color: 'white' },
                            '& .MuiAlert-action': { color: 'white' }
                        }}
                    >
                        {alertMessage}
                    </Alert>
                </Box>
            </Fade>
        </Box>
    );
};

export default InterviewQuestions;