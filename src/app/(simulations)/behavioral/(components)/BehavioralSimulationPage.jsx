"use client";

import React, {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import Button from "@mui/material/Button";
import TalkingInterviewer from "./TalkingInterviewer";
import {motion} from "framer-motion";
import VideocamIcon from "@mui/icons-material/Videocam";

const InterviewQuestions = ({questions}) => {
    const router = useRouter();
    const lastIndex = questions.length - 1;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [transcript, setTranscript] = useState("");
    const audioRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hasRecorded, setHasRecorded] = useState(false);

    const videoRef = useRef(null);
    const [mediaStream, setMediaStream] = useState(null);
    const [micActive, setMicActive] = useState(false);
    const [videoActive, setVideoActive] = useState(false);

    //  webcam stream
    const handleToggleVideo = async () => {
        if (videoActive) {
            // stop and clear
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

    // set up webcam stream
    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [videoRef, mediaStream]);

    // cleanup function
    useEffect(() => {
        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };
    }, [mediaStream]);

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

            // at the last question, when the audio is done, route to the results page
            if (currentQuestionIndex === lastIndex) {
                audio.addEventListener("ended", () => {
                    router.push("/behavioral/results");
                });
            }

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
        setCurrentQuestionIndex((idx) => idx + 1);
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
            }}
        >

            {/* toggle webcam button */}
            <Box
                onClick={handleToggleVideo}
                sx={{
                    width: { xs: "50%", sm: "25%", md: "13.5%" },
                    mt: 1,
                    aspectRatio: "4/3",
                    border: "2px solid #ccc",
                    borderRadius: 1,
                    zIndex: 1000,
                    overflow: "hidden",
                    position: "relative",
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
                        fontSize: "0.75rem",
                        color: "#7c7c7c",
                        fontFamily: 'DM Sans, sans-serif',
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem"
                    }}>
                        Toggle Webcam <VideocamIcon sx={{color:"#7c7c7c", fontSize: '1rem'}}/>
                    </Box>
                )}
            </Box>


            <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                <TalkingInterviewer isTalking={isSpeaking} />
            </Box>

            {/*<Typography variant="h5" sx={{ marginBottom: 2 }}>*/}
            {/*    {questions[currentQuestionIndex]}*/}
            {/*</Typography>*/}

            {/* Hidden audio element used to play TTS audio */}
            <audio ref={audioRef} style={{display: "none"}} src={audioUrl}/>

            <Box
                sx={{
                    width: { xs: "50%", sm: "25%", md: "13.5%" },
                    mt: 1,}}
            >
                <IconButton
                    disabled={currentQuestionIndex === lastIndex || hasRecorded}
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
