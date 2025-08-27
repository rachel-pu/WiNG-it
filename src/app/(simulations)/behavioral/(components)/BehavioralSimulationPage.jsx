"use client";

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import Button from "@mui/material/Button";
import TalkingInterviewer from "./TalkingInterviewer";
import VideocamIcon from "@mui/icons-material/Videocam";
import {CircularProgress, Typography, Snackbar, Alert} from "@mui/material";

const InterviewQuestions = ({questions}) => {
    const router = useRouter();

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
            setAlertMessage("Fetching question audio...");
            setAlertSeverity("info");
            setShowAlert(true);

            const response = await fetch("http://127.0.0.1:5000/text-to-speech", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({text})
            });

            if (!response.ok) {
                console.error("Error fetching audio:", response.status);
                setAlertMessage("Failed to load question audio");
                setAlertSeverity("error");
                setShowAlert(true);
                return;
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

            setAlertMessage("Question audio loaded successfully");
            setAlertSeverity("success");
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 2000);
        } catch (error) {
            console.error("Error in text-to-speech fetch:", error);
            setAlertMessage("Error loading question audio");
            setAlertSeverity("error");
            setShowAlert(true);
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

            setAlertMessage("Processing your answer...");
            setAlertSeverity("info");
            setShowAlert(true);
        }
    };

    const processAudioBlob = async (audioBlob, questionIndexAtRecordingStart) => {
        try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.wav");
            formData.append("question_number", (currentQuestionIndex + 1).toString());
            formData.append("question_text", questions[currentQuestionIndex]);
            formData.append("session_id", sessionId);

            console.log("Sending audio for transcription...");

            const response = await fetch("http://127.0.0.1:5000/save-and-transcribe", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();
            console.log("Transcription response:", data);

            if (data.success) {
                setTranscript(data.response_data?.transcript || "");
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

    return (
        <Box
            sx={{
                position: 'relative',
                width: {
                    xs: 'calc(100vw - 0px)',    // Mobile: full width (no sidebar)
                    sm: 'calc(100vw - 72px)',   // Small: subtract collapsed sidebar
                    md: 'calc(100vw - 240px)'   // Medium+: subtract full sidebar
                },
                height: 'calc(100vh - 64px)', // Subtract navbar height
                backgroundImage: "url(/static/images/zoom-background.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Question indicator - Fixed position */}
            <Box sx={{
                position: 'absolute',
                top: 20,
                left: 20,
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontFamily: 'DM Sans',
                fontSize: '1rem',
                fontWeight: 'bold',
                zIndex: 1000
            }}>
                Question {currentQuestionIndex + 1} of {questions.length}
            </Box>

            {/* Webcam toggle - Fixed position */}
            <Box
                onClick={handleToggleVideo}
                sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    width: 160,
                    height: 120,
                    border: "2px solid #ccc",
                    borderRadius: 2,
                    zIndex: 1000,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: videoActive ? "transparent" : "#f0f0f0",
                    "&:hover": {
                        backgroundColor: videoActive ? "rgba(0, 0, 0, 0.1)" : "#e0e0e0",
                    },
                }}
            >
                {videoActive ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <Box sx={{
                        fontSize: "0.8rem",
                        color: "#7c7c7c",
                        fontFamily: 'DM Sans, sans-serif',
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.3rem"
                    }}>
                        <VideocamIcon sx={{color:"#7c7c7c", fontSize: '1.5rem'}}/>
                        <span>Toggle Webcam</span>
                    </Box>
                )}
            </Box>

            {/* Main interviewer area - Centered and full size */}
            <Box sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                minHeight: 0,
                position: 'relative'
            }}>
                <Box sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <TalkingInterviewer isTalking={isSpeaking} />
                </Box>
            </Box>

            {/* Transcript display - Fixed position */}
            {transcript && (
                <Box sx={{
                    position: 'absolute',
                    bottom: 130,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '70%',
                    maxWidth: '500px',
                    maxHeight: '100px',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 1000
                }}>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontFamily: 'DM Sans', fontWeight: 'bold', mb: 0.5, fontSize: '0.85rem' }}
                    >
                        Your answer (transcript):
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'DM Sans', fontSize: '0.9rem' }}>
                        {transcript}
                    </Typography>
                </Box>
            )}

            {/* Recording controls - Fixed at bottom center */}
            <Box sx={{
                position: 'absolute',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <IconButton
                    disabled={isProcessing || hasRecorded}
                    onClick={isRecording ? stopRecording : startRecording}
                    sx={{
                        width: 70,
                        height: 70,
                        backgroundColor: isProcessing ? "#f0f0f0" :
                            hasRecorded ? "#4caf50" :
                                isRecording ? "#ff6b6b" : "#2196f3",
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        "&:hover": {
                            backgroundColor: isProcessing ? "#f0f0f0" :
                                hasRecorded ? "#45a049" :
                                    isRecording ? "#ff5252" : "#1976d2",
                            transform: 'scale(1.05)'
                        },
                        "&:disabled": {
                            backgroundColor: "#f0f0f0",
                            color: "#ccc"
                        },
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    {isProcessing ? <CircularProgress size={28} sx={{color: '#666'}}/> :
                        isRecording ? <StopIcon sx={{fontSize: 35}}/> :
                            <MicIcon sx={{fontSize: 35}}/>}
                </IconButton>
            </Box>

            {/* Next button - Right side, aligned with microphone height */}
            {hasRecorded && (
                <Box sx={{
                    position: "absolute",
                    bottom: 40, // Same as microphone bottom position
                    right: 30,
                    zIndex: 1000
                }}>
                    <Button
                        variant="contained"
                        onClick={handleNextQuestion}
                        sx={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontFamily: 'DM Sans',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            "&:hover": {
                                backgroundColor: '#45a049',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Interview"}
                    </Button>
                </Box>
            )}

            {/* Hidden audio element */}
            <audio ref={audioRef} style={{display: "none"}} />

            {/* Status alerts */}
            <Snackbar
                open={showAlert}
                autoHideDuration={5000}
                onClose={() => setShowAlert(false)}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                sx={{ zIndex: 2000 }}
            >
                <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default InterviewQuestions;