"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import Button from "@mui/material/Button";

const InterviewQuestions = ({ questions }) => {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [transcript, setTranscript] = useState("");
    const audioRef = useRef(null);

    // Fetch the TTS audio for the current question using your Flask endpoint.
    const fetchAndPlayQuestionAudio = async (text) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/text-to-speech", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text })
            });
            if (!response.ok) {
                console.error("Error fetching audio");
                return;
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (error) {
            console.error("Error in text-to-speech fetch:", error);
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
        if (audioUrl && audioRef.current) {
            audioRef.current.load();
            audioRef.current.play();
        }
    }, [audioUrl]);

    const startRecording = () => {
        setIsRecording(true);
    };

    const stopRecording = () => {
        setIsRecording(false);
    };

    // When recording stops, send the recorded audio to the speech-to-text endpoint.
    const onStop = async (recordedBlob) => {
        console.log("Recorded Blob:", recordedBlob);
        const formData = new FormData();
        formData.append("audio", recordedBlob.blob, "recording.wav");

        try {
            const response = await fetch("http://127.0.0.1:5000/speech-to-text", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            console.log("Speech-to-text response:", data);
            setTranscript(data.transcript);

            // Advance to the next question or go to the results page.
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                router.push("/behavioral/results");
            }
        } catch (error) {
            console.error("Error in speech-to-text:", error);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            router.push("/behavioral/results");
        }
    };

    return (
        <Box
            component="main"
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',textAlign: 'center', flexDirection:'column'}}
        >
            <Typography variant="h5" sx={{ marginBottom: 2 }}>
                {questions[currentQuestionIndex]}
            </Typography>

            {/* Hidden audio element used to play TTS audio */}
            <audio ref={audioRef} style={{ display: "none" }} src={audioUrl} />

            <IconButton
                onClick={isRecording ? stopRecording : startRecording}
                color="primary"
                sx={{ fontSize: 40 }}
            >
                {isRecording ? <StopIcon fontSize="inherit" /> : <MicIcon fontSize="inherit" />}
            </IconButton>

            <Box sx={{ marginTop: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleNextQuestion}
                >
                    Next
                </Button>
            </Box>
        </Box>
    );
};

export default InterviewQuestions;
