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
import { useNavigate, useSearchParams } from "react-router-dom";
import DefaultAppLayout from "../../../../DefaultAppLayout.jsx";


const RetryQuestionPage = () => {
    const [searchParams] = useSearchParams();
    const containerRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [transcript, setTranscript] = useState("");
    const audioRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const [userId, setUserId] = useState("");
    const [questionNumber, setQuestionNumber] = useState(null);
    const [questionText, setQuestionText] = useState("");
    const [loading, setLoading] = useState(true);
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

    // Get parameters from URL
    useEffect(() => {
        const userIdParam = searchParams.get("userId");
        const sessionIdParam = searchParams.get("sessionId");
        const questionNumberParam = searchParams.get("questionNumber");

        if (userIdParam && sessionIdParam && questionNumberParam) {
            setUserId(userIdParam);
            setSessionId(sessionIdParam);
            setQuestionNumber(parseInt(questionNumberParam));
        }
    }, [searchParams]);

    // Fetch the question text from the backend
    useEffect(() => {
        const fetchQuestionData = async () => {
            if (!userId || !sessionId || !questionNumber) return;

            try {
                setLoading(true);
                const res = await fetch(
                    "https://us-central1-wing-it-e6a3a.cloudfunctions.net/getInterviewResults",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId, sessionId }),
                    }
                );

                if (!res.ok) {
                    throw new Error(`Server error: ${res.status}`);
                }

                const result = await res.json();

                if (result.data && result.data.success) {
                    const responses = result.data.responses || {};
                    const questionData = responses[questionNumber];

                    if (questionData) {
                        setQuestionText(questionData.questionText);
                    } else {
                        throw new Error("Question not found");
                    }
                }
            } catch (err) {
                console.error("Error fetching question:", err);
                setAlertMessage("Failed to load question data");
                setAlertSeverity("error");
                setShowAlert(true);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestionData();
    }, [userId, sessionId, questionNumber]);

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

    // Fetch TTS audio for the question
    const fetchAndPlayQuestionAudio = async (text) => {
        if (isLoadingAudio || !text) return;

        try {
            setIsLoadingAudio(true);

            const response = await fetch("https://us-central1-wing-it-e6a3a.cloudfunctions.net/handleTextToSpeech", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text,
                    voice: "sky",
                    speed: 1.0
                })
            });

            if (!response.ok) {
                console.error("Error fetching audio:", response.status, await response.text());
                return;
            }

            const audioBlob = await response.blob();
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
        } catch (error) {
            console.error("Error in text-to-speech fetch:", error);
        } finally {
            setIsLoadingAudio(false);
        }
    };

    // Play audio when question text is loaded
    useEffect(() => {
        if (questionText && !isLoadingAudio) {
            fetchAndPlayQuestionAudio(questionText);
        }
    }, [questionText]);

    // When the audio URL is updated, load and play the audio
    useEffect(() => {
        const audio = audioRef.current;
        if (audio && audioUrl) {
            if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }

            const handlePlay = () => {
                setIsSpeaking(true);
            };
            const handleEnded = () => {
                setIsSpeaking(false);
            };
            const handleError = (e) => {
                console.error("Audio playback error:", e);
                setIsSpeaking(false);
                setAlertMessage("Audio format not supported. Please try refreshing.");
                setAlertSeverity("error");
                setShowAlert(true);
            };

            audio.src = audioUrl;
            audio.addEventListener("play", handlePlay);
            audio.addEventListener("ended", handleEnded);
            audio.addEventListener("error", handleError);

            audio.load();

            setTimeout(() => {
                if (audio.paused) {
                    audio.play().catch((err) => {
                        console.error("Autoplay failed:", err);
                        setIsSpeaking(false);
                        setAlertMessage("Failed to play audio automatically. Please click to play.");
                        setAlertSeverity("info");
                        setShowAlert(true);
                    });
                }
            }, 100);

            return () => {
                if (!audio.paused) {
                    audio.pause();
                }
                audio.removeEventListener("play", handlePlay);
                audio.removeEventListener("ended", handleEnded);
                audio.removeEventListener("error", handleError);
            };
        }
    }, [audioUrl]);

    // Set up recording functionality
    useEffect(() => {
        const setupRecording = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({audio: true});
                const supportedTypes = [
                    'audio/webm;codecs=opus',
                    'audio/webm',
                    'audio/ogg;codecs=opus',
                    'audio/wav'
                ];

                let selectedType = 'audio/webm';
                for (const type of supportedTypes) {
                    if (MediaRecorder.isTypeSupported(type)) {
                        selectedType = type;
                        break;
                    }
                }

                mediaRecorder.current = new MediaRecorder(stream, { mimeType: selectedType });

                mediaRecorder.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunks.current.push(event.data);
                    }
                };
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
            audioChunks.current = [];
            mediaRecorder.current.start();
            recordingStartTime = Date.now();
            setIsRecording(true);
            setShowWinnieCaption(false);

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, {type: 'audio/webm'});
                audioChunks.current = [];
                const recordDuration = Math.floor((Date.now() - recordingStartTime) / 1000);
                await processAudioBlob(audioBlob, recordDuration);
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
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
            setHasRecorded(true);

            if (recordInterval) {
                clearInterval(recordInterval);
                setRecordInterval(null);
            }

            // Show loading message immediately
            setTranscript("Transcribing your answer...");

            setAlertMessage("Answer recorded! Processing in background...");
            setAlertSeverity("success");
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 2000);
        }
    };

    const processAudioBlob = async (audioBlob, recordTime) => {
        // Process in background without blocking UI
        try {
            const arrayBuffer = await audioBlob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
            }
            const base64Audio = btoa(binaryString);

            const payload = {
                userId,
                sessionId,
                questionNumber: questionNumber,
                questionText: questionText,
                recordedTime: recordTime,
                audioData: base64Audio,
                mimetype: audioBlob.type || "audio/webm",
                isRetry: true
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
                setTranscript(data.transcript || "Transcription completed.");
                setIsProcessing(false);
                console.log("Transcription completed successfully in background");
            } else {
                throw new Error(data.error || "Unknown error");
            }

        } catch (error) {
            console.error("Error processing audio:", error);
            setTranscript(`Transcription error: ${error.message}. Your answer was still recorded.`);
            setIsProcessing(false);
        }
    };

    const handleFinish = () => {
        const url = `/behavioral/results?userId=${encodeURIComponent(userId)}&sessionId=${encodeURIComponent(sessionId)}&refresh=true`;
        navigate(url);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen?.()
            .then(() => setIsFullscreen(true))
            .catch((err) => console.error("Fullscreen request failed:", err));
        } else {
            document.exitFullscreen?.()
            .then(() => setIsFullscreen(false))
            .catch((err) => console.error("Exit fullscreen failed:", err));
        }
    };

    if (loading) {
        return (
            <DefaultAppLayout>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                    <CircularProgress size={60} sx={{ color: 'white' }} />
                    <Typography sx={{ ml: 2, fontSize: '1.2rem', color: 'white', fontFamily: 'DM Sans' }}>
                        Loading question...
                    </Typography>
                </Box>
            </DefaultAppLayout>
        );
    }

    return (
        <DefaultAppLayout>
            <Box
                ref={containerRef}
                className="simulation-container"
            >
            {/* Zoom-like Top Bar */}
            <Box className="simulation-top-bar">
                {/* Left side - Meeting info */}
                <Box className="simulation-meeting-info">
                    <Box className="simulation-meeting-badge">
                        Retry Question {questionNumber}
                    </Box>
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
                        Winnie (Interviewer)
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
                            You
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
                    {questionText}
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
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {isProcessing && (
                            <CircularProgress size={16} />
                        )}
                        <Typography
                            variant="body2"
                            className="simulation-transcript-text"
                        >
                            {transcript}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Zoom-like bottom control bar */}
            <Box className="simulation-bottom-bar">
                {/* Microphone button */}
                <IconButton
                    disabled={hasRecorded}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`simulation-mic-btn ${
                        hasRecorded ? 'recorded' :
                        isRecording ? 'recording' : 'idle'
                    }`}
                >
                    {isRecording ? <StopIcon /> : <MicIcon />}
                </IconButton>

                {/* Finish button */}
                {hasRecorded && (
                    <Button
                        variant="contained"
                        onClick={handleFinish}
                        className="simulation-next-btn"
                    >
                        View Results
                    </Button>
                )}
            </Box>

            {/* Hidden audio element */}
            <audio ref={audioRef} className="simulation-audio-hidden" />

            {/* Status alerts */}
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
        </DefaultAppLayout>
    );
};

export default RetryQuestionPage;
