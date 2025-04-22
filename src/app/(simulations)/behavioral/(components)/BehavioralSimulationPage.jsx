"use client";

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import Button from "@mui/material/Button";
import TalkingInterviewer from "./TalkingInterviewer";

const InterviewQuestions = ({questions}) => {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [transcript, setTranscript] = useState("");
    const audioRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);


    // Fetch the TTS audio for the current question using your Flask endpoint.
    const fetchAndPlayQuestionAudio = async (text) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/text-to-speech", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({text})
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
            });

            return () => {
                audio.removeEventListener("play", handlePlay);
                audio.removeEventListener("ended", handleEnded);
            };
        }
    }, [audioUrl]);


    const startRecording = () => {
        setIsRecording(true);
    };

    const stopRecording = () => {
        setIsRecording(false);
        setHasRecorded(true);
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
        setHasRecorded(false);
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
                backgroundSize: "cover"
            }}
        >

            {/*<Typography variant="h5" sx={{ marginBottom: 2 }}>*/}
            {/*    {questions[currentQuestionIndex]}*/}
            {/*</Typography>*/}

            {/* Hidden audio element used to play TTS audio */}
            <audio ref={audioRef} style={{display: "none"}} src={audioUrl}/>

            <Box sx={{position: "absolute", bottom: 40, left: 830}}>
                <IconButton
                    disabled={hasRecorded}
                    onClick={isRecording ? stopRecording : startRecording}
                    color="primary"
                    sx={{
                        fontSize: 40,
                        backgroundColor: hasRecorded ? "lightgray" : "lightgray",
                        borderRadius: "50%",
                        width: 60,
                        height: 60,
                        "&:hover": {
                            backgroundColor: hasRecorded ? "lightgray" : "#b0b0b0"
                        }
                    }}
                >
                    {isRecording ? <StopIcon fontSize="inherit"/> : <MicIcon fontSize="inherit"/>}
                </IconButton>

            </Box>

            <Box sx={{position: "absolute", bottom: 96, left: 600}}>
                <TalkingInterviewer isTalking={isSpeaking}/>
            </Box>

            {hasRecorded && (
                <Box sx={{position: "absolute", bottom: 50, right: 50}}>
                    <Button
                        variant="contained"
                        onClick={handleNextQuestion}
                    >
                        Next
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default InterviewQuestions;
