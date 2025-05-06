"use client";

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import Button from "@mui/material/Button";
import TalkingInterviewer from "./TalkingInterviewer";
import {CircularProgress, Typography, Snackbar, Alert} from "@mui/material";

// Add this import if you're using React recorder or similar
// import { ReactMic } from 'react-mic';

const InterviewQuestions = ({questions}) => {
    const router = useRouter();

    // instead of current question index
    const [currentRecordingQuestion, setCurrentRecordingQuestion] = useState({
        index: 0,
        text: ""
    });

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

    // Media recorder objects
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    // Generate a session ID when the component mounts
    useEffect(() => {
        const newSessionId = `session-${Date.now()}`;
        setSessionId(newSessionId);
        console.log("Interview session ID:", newSessionId);
    }, []);

    // Fetch the TTS audio for the current question using your Flask endpoint.
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

            // Auto-hide the alert after 2 seconds
            setTimeout(() => setShowAlert(false), 2000);
        } catch (error) {
            console.error("Error in text-to-speech fetch:", error);
            setAlertMessage("Error loading question audio");
            setAlertSeverity("error");
            setShowAlert(true);
        }
    };

    // When a new question loads, fetch its audio.
    useEffect(() => {
        if (questions.length && currentQuestionIndex < questions.length) {
            fetchAndPlayQuestionAudio(questions[currentQuestionIndex]);
        }
    }, [currentQuestionIndex, questions]);

    // When the audio URL is updated, load and play the audio.
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
            const questionIndexAtRecordingStart = currentQuestionIndex; // Capture current index
            audioChunks.current = [];
            mediaRecorder.current.start();
            setIsRecording(true);
            console.log("Recording started");

            // Override the onstop handler to pass the captured index
            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, {type: 'audio/wav'});
                audioChunks.current = [];
                await processAudioBlob(audioBlob, questionIndexAtRecordingStart); // Pass it down
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
            // Create form data
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.wav");
            formData.append("question_number", (currentQuestionIndex + 1).toString()); // Use captured index
            // console.log("question number:   ", currentQuestionIndex + 1);
            formData.append("question_text", questions[currentQuestionIndex]); // Use captured index
            // console.log("question text:   ", questions[currentQuestionIndex]);
            formData.append("session_id", sessionId);

            console.log("Sending audio for transcription...");

            // Try the save-and-transcribe endpoint
            const response = await fetch("http://127.0.0.1:5000/save-and-transcribe", {
                method: "POST",
                body: formData
            });
            console.log(response);

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
            // Pass session ID both in URL and sessionStorage
            const url = `/behavioral/results?sessionId=${encodeURIComponent(sessionId)}`;
            sessionStorage.setItem("interviewSessionId", sessionId);
            router.push(url);
        }
        setHasRecorded(false);
        setTranscript("");
    };


    return (
        <Box
            component="main"
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                textAlign: 'center',
                flexDirection: 'column',
                backgroundImage: "url(/static/images/zoom-background.png)",
                backgroundSize: "cover",
                position: 'relative'
            }}
        >
            {/* Current question indicator */}
            <Box sx={{
                position: 'absolute',
                top: 20,
                left: 20,
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '5px 10px',
                borderRadius: '4px'
            }}>
                Question {currentQuestionIndex + 1} of {questions.length}
            </Box>

            {/* Hidden audio element used to play TTS audio */}
            <audio ref={audioRef} style={{display: "none"}} src={audioUrl} controls/>

            {/* Transcript display (optional) */}
            {transcript && (
                <Box sx={{
                    position: 'absolute',
                    bottom: 150,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    maxHeight: '100px',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    padding: '10px',
                    borderRadius: '8px',
                    textAlign: 'left'
                }}>
                    <Typography variant="body2" color="textSecondary">
                        Your answer (transcript):
                    </Typography>
                    <Typography variant="body1">
                        {transcript}
                    </Typography>
                </Box>
            )}

            {/* Recording controls */}
            <Box sx={{position: "absolute", bottom: 40, left: '50%', transform: 'translateX(-50%)'}}>
                <IconButton
                    disabled={isProcessing || hasRecorded}
                    onClick={isRecording ? stopRecording : startRecording}
                    color="primary"
                    sx={{
                        fontSize: 40,
                        backgroundColor: isProcessing ? "#f0f0f0" :
                            hasRecorded ? "lightgray" :
                                isRecording ? "#ff6b6b" : "lightgray",
                        borderRadius: "50%",
                        width: 60,
                        height: 60,
                        "&:hover": {
                            backgroundColor: isProcessing ? "#f0f0f0" :
                                hasRecorded ? "lightgray" :
                                    isRecording ? "#ff5252" : "#b0b0b0"
                        }
                    }}
                >
                    {isProcessing ? <CircularProgress size={24}/> :
                        isRecording ? <StopIcon fontSize="inherit"/> :
                            <MicIcon fontSize="inherit"/>}
                </IconButton>
            </Box>

            {/* Animated interviewer */}
            <Box sx={{position: "absolute", bottom: 96, left: '50%', transform: 'translateX(-50%)'}}>
                <TalkingInterviewer isTalking={isSpeaking}/>
            </Box>

            {/* Next button */}
            {hasRecorded && (
                <Box sx={{position: "absolute", bottom: 50, right: 50}}>
                    <Button
                        variant="contained"
                        onClick={handleNextQuestion}
                    >
                        {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Interview"}
                    </Button>
                </Box>
            )}

            {/* Status alerts */}
            <Snackbar
                open={showAlert}
                autoHideDuration={5000}
                onClose={() => setShowAlert(false)}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default InterviewQuestions;