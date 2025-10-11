"use client";

import {useEffect, useRef, useState} from "react";
import "./BehavioralSimulationPage.css";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import Button from "@mui/material/Button";
import TalkingInterviewer from "./TalkingInterviewer";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import {CircularProgress, Typography, Alert, Fade} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";


const InterviewQuestions = ({questions}) => {
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
    const [userId, setUserId] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("info");
    const [showAlert, setShowAlert] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [recordTime, setRecordTime] = useState(0); 
    const [recordInterval, setRecordInterval] = useState(null);
    const [showWinnieCaption, setShowWinnieCaption] = useState(true);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const navigate = useNavigate();


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

     useEffect(() => {
        // Helper to get a cookie value by name
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        };

        const userId = getCookie('user_id');
        
        if (userId) {
            setUserId(userId);
        } else {
            console.log('No user_id cookie found');
        }
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
        // Prevent multiple simultaneous audio requests
        if (isLoadingAudio) {
            // console.log("Audio already loading, skipping request");
            return;
        }

        try {
            setIsLoadingAudio(true);
            // console.log("Fetching audio for:", text.substring(0, 50));

            const response = await fetch("https://us-central1-wing-it-e6a3a.cloudfunctions.net/handleTextToSpeech", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text,
                    voice: "sky", // Use Lemonfox.ai voice
                    speed: 1.0 // Normal speaking speed
                })
            });

            if (!response.ok) {
                console.error("Error fetching audio:", response.status, await response.text());
                return;
            }

            const audioBlob = await response.blob();
            // console.log("Audio blob type:", audioBlob.type);
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            setTimeout(() => setShowAlert(false), 2000);
        } catch (error) {
            console.error("Error in text-to-speech fetch:", error);
        } finally {
            setIsLoadingAudio(false);
        }
    };

    // When a new question loads, fetch its audio
    useEffect(() => {
        if (questions.length && currentQuestionIndex < questions.length && !isLoadingAudio) {
            fetchAndPlayQuestionAudio(questions[currentQuestionIndex]);
        }
    }, [currentQuestionIndex, questions]);

    // When the audio URL is updated, load and play the audio
    useEffect(() => {
        const audio = audioRef.current;
        if (audio && audioUrl) {
            // Stop any currently playing audio before starting new one
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }

            const handlePlay = () => {
                // console.log("Audio started playing");
                setIsSpeaking(true);
            };
            const handleEnded = () => {
                // console.log("Audio finished playing");
                setIsSpeaking(false);
            };
            const handleError = (e) => {
                console.error("Audio playback error:", e);
                setIsSpeaking(false);
                setAlertMessage("Audio format not supported. Please try refreshing.");
                setAlertSeverity("error");
                setShowAlert(true);
            };
            const handleCanPlay = () => {
                // console.log("Audio ready to play");
            };

            audio.src = audioUrl;
            audio.addEventListener("play", handlePlay);
            audio.addEventListener("ended", handleEnded);
            audio.addEventListener("error", handleError);
            audio.addEventListener("canplay", handleCanPlay);

            audio.load();

            // Add a small delay before attempting to play
            setTimeout(() => {
                // Double-check audio isn't already playing before starting
                if (audio.paused) {
                    audio.play().catch((err) => {
                        console.error("Autoplay failed:", err);
                        setIsSpeaking(false);
                        if (err.name === 'NotSupportedError') {
                            setAlertMessage("Audio format not supported by browser. Falling back...");
                            setAlertSeverity("warning");
                        } else {
                            setAlertMessage("Failed to play audio automatically. Please click to play.");
                            setAlertSeverity("info");
                        }
                        setShowAlert(true);
                    });
                }
            }, 100);

            return () => {
                // Clean up audio when component unmounts or audioUrl changes
                if (!audio.paused) {
                    audio.pause();
                }
                audio.removeEventListener("play", handlePlay);
                audio.removeEventListener("ended", handleEnded);
                audio.removeEventListener("error", handleError);
                audio.removeEventListener("canplay", handleCanPlay);
            };
        }
    }, [audioUrl]);

    // Set up recording functionality
    useEffect(() => {
        const setupRecording = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({audio: true});
                // Check what audio formats are supported
                const supportedTypes = [
                    'audio/webm;codecs=opus',
                    'audio/webm',
                    'audio/ogg;codecs=opus',
                    'audio/wav'
                ];
                
                let selectedType = 'audio/webm'; // fallback
                for (const type of supportedTypes) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        selectedType = type;
                        // console.log('Using audio format:', type);
                        break;
                    }
                }
                
                mediaRecorder.current = new MediaRecorder(stream, { mimeType: selectedType });

                mediaRecorder.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunks.current.push(event.data);
                    }
                };

                mediaRecorder.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunks.current, {type: selectedType});
                    audioChunks.current = [];

                };

                // console.log("Audio recording initialized successfully");
            } catch (error) {
                console.error("Error setting up audio recording:", error);
                setAlertMessage("Failed to set up audio recording. Please check microphone permissions.");
                setAlertSeverity("error");
                setShowAlert(true);
            }
        };

        setupRecording();
    }, []);

    let recordingStartTime;
    const startRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'inactive') {
            const questionIndexAtRecordingStart = currentQuestionIndex;
            audioChunks.current = [];
            mediaRecorder.current.start();
            recordingStartTime = Date.now();
            setIsRecording(true);
            // console.log("Recording started");
            setShowWinnieCaption(false);

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, {type: 'audio/webm'});
                audioChunks.current = [];
                const recordDuration = Math.floor((Date.now() - recordingStartTime) / 1000);
                await processAudioBlob(audioBlob, questionIndexAtRecordingStart, recordDuration);
            };

            setRecordTime(0);
            const interval = setInterval(() => {
                setRecordTime(prev => prev + 1);
            }, 1000);
            setRecordInterval(interval);

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
            // console.log("Recording stopped");

             if (recordInterval) {
                clearInterval(recordInterval);
                setRecordInterval(null);
            }

            setAlertMessage("Processing your answer...");
            setAlertSeverity("info");
            setShowAlert(true);
        }
    };

    const processAudioBlob = async (audioBlob, questionIndexAtRecordingStart, recordTime) => {
    try {
        // console.log('Processing audio blob:', {
        //     size: audioBlob.size,
        //     type: audioBlob.type,
        //     recordTime: recordTime
        // });

        // Convert audio blob to base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
            binaryString += String.fromCharCode(uint8Array[i]);
        }
        const base64Audio = btoa(binaryString);

        // console.log('Base64 audio length:', base64Audio.length);

        // Prepare JSON payload with actual blob mimetype
        const payload = {
            userId,
            sessionId,
            questionNumber: currentQuestionIndex + 1,
            questionText: questions[currentQuestionIndex],
            recordedTime: recordTime,
            audioData: base64Audio,
            mimetype: audioBlob.type || "audio/webm" // Use actual blob type
        };

        console.log('Payload size:', JSON.stringify(payload).length);

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
        
        // Debug transcript specifically
        console.log("Transcript received:", data.transcript);
        console.log("Transcript length:", data.transcript?.length);

        if (data.success) {
            setTranscript(data.transcript || "");
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
        setShowWinnieCaption(true)

        // Clean up audio state
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
        setIsSpeaking(false);
        setIsLoadingAudio(false);

        if (recordInterval) {
            clearInterval(recordInterval);
            setRecordInterval(null);
        }
        setRecordTime(0);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            const url = `/behavioral/results?userId=${encodeURIComponent(userId)}&sessionId=${encodeURIComponent(sessionId)}`;
            sessionStorage.setItem("uesrId", userId);
            sessionStorage.setItem("interviewSessionId", sessionId);
            navigate(url);
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
            className="simulation-container"
        >
            {/* Zoom-like Top Bar */}
            <Box className="simulation-top-bar">
                {/* Left side - Meeting info */}
                <Box className="simulation-meeting-info">
                    <Box className="simulation-meeting-badge">
                        Behavioral Interview
                    </Box>
                    <Typography className="simulation-question-counter">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </Typography>
                </Box>

                {/* Right side - Controls */}
                <Box className="simulation-controls">
                    <IconButton
                        size="small"
                        className="simulation-control-btn"
                        onClick={toggleFullscreen}
                    >
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>


                    <IconButton
                        size="small"
                        className="simulation-control-btn"
                    >
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Main video area */}
            <Box className="simulation-video-area">
                {/* Interviewer video - main */}
                <Box className={`simulation-interviewer-video ${isSpeaking ? 'speaking' : ''}`}>
                
                    <Box className="simulation-timer">
                        {Math.floor(recordTime / 60)
                            .toString()
                            .padStart(2, "0")}
                        :
                        {(recordTime % 60).toString().padStart(2, "0")}
                    </Box>

                    {/* Name tag */}
                    <Box className="simulation-name-tag">
                        Winnie (Interviewer) {isSpeaking}
                    </Box>

                    {/* Interviewer avatar/video */}
                    <Box className="simulation-interviewer-content">
                        <TalkingInterviewer isTalking={isSpeaking} />
                    </Box>
                </Box>

                {/* User video - floating overlay when active */}
                {videoActive && (
                    <Box
                        className={`simulation-user-video ${isRecording ? 'recording' : ''}`}
                        onClick={handleToggleVideo}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* Name tag */}
                        <Box className="simulation-user-name-tag">
                            You {isRecording}
                        </Box>

                        {/* User video */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="simulation-user-video-element"
                        />

                    </Box>
                )}

                {/* Floating video toggle (when camera is off) */}
                {!videoActive && (
                    <Box
                        className="simulation-video-placeholder"
                        onClick={handleToggleVideo}
                    >
                        <VideocamOffIcon className="simulation-video-placeholder-icon" />
                        <Typography className="simulation-video-placeholder-text">
                            Start Video
                        </Typography>
                        
                        {/* Name tag */}
                        <Box className="simulation-user-name-tag">
                            You
                        </Box>
                    </Box>
                )}
            </Box>

            {showWinnieCaption && (
                <Box className="simulation-question-caption">
                    {questions[currentQuestionIndex]}
                </Box>
                )}


            {/* Transcript floating window */}
            {transcript && (
                <Box className="simulation-transcript">
                    <Typography
                        variant="body2"
                        className="simulation-transcript-label"
                    >
                        Transcript:
                    </Typography>
                    <Typography
                        variant="body2"
                        className="simulation-transcript-text"
                    >
                        {transcript}
                    </Typography>
                </Box>
            )}

            {/* Zoom-like bottom control bar */}
            <Box className="simulation-bottom-bar">
                {/* Microphone button */}
                <IconButton
                    disabled={isProcessing || hasRecorded}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`simulation-mic-btn ${
                        isProcessing ? 'processing' :
                        hasRecorded ? 'recorded' :
                        isRecording ? 'recording' : 'idle'
                    }`}
                >
                    {isProcessing ? <CircularProgress size={24} className="simulation-loading-spinner"/> :
                        isRecording ? <StopIcon /> :
                            <MicIcon />}
                </IconButton>                

                {/* Next/Finish button */}
                {hasRecorded && (
                    <Button
                        variant="contained"
                        onClick={handleNextQuestion}
                        className="simulation-next-btn"
                    >
                        {currentQuestionIndex < questions.length - 1 ? "Next Question" : "End Interview"}
                    </Button>
                )}
            </Box>

            {/* Hidden audio element */}
            <audio ref={audioRef} className="simulation-audio-hidden" />

            {/* Status alerts - Fixed positioning within simulation */}
            <Fade in={showAlert} timeout={300}>
                <Box className="simulation-alert-container">
                    <Alert
                        severity={alertSeverity}
                        onClose={() => setShowAlert(false)}
                        className="simulation-alert"
                    >
                        {alertMessage}
                    </Alert>
                </Box>
            </Fade>
        </Box>
    );
};

export default InterviewQuestions;