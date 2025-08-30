"use client"
// import InterviewQuestions from "../../../../components/InterviewQuestions";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { SignedIn } from "@clerk/nextjs";
import CssBaseline from "@mui/material/CssBaseline";
import MainAppBar from "../../../../components/MainAppBar";
import LeftNavbar from "../../../../components/LeftNavbar";
import React, {useState} from "react";
import {useEffect} from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";
import Typography from "@mui/material/Typography";
import QuickstartPage from "@/app/(simulations)/behavioral/(components)/QuickstartPage";
import BehavioralSimulationPage from "@/app/(simulations)/behavioral/(components)/BehavioralSimulationPage";
import {CircularProgress} from "@mui/material";
import Page_Template from "../../DefaultAppLayout";

export default function BehavioralInterviewSimulation() {
    const [questions, setQuestions] = useState([]);
    const router = useRouter();
    const [jobRole, setJobRole] = useState("");
    const [numQuestions, setNumQuestions] = useState(5);
    const [questionTypes, setQuestionTypes] = useState([]);
    const [interviewerDifficulty, setInterviewerDifficulty] = useState("easy-going");
    const [showQuickstart, setShowQuickstart] = useState(true);


    const fetchQuestions = async () => {
        try {
            const response = await fetch('https://wing-it-un4w.onrender.com/generate_questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    job_role: jobRole,
                    numQuestions: numQuestions,
                    questionTypes: questionTypes,
                    interviewerDifficulty: interviewerDifficulty,
                })
            });

            const data = await response.json();
            console.log("API Response:", data); // Debugging
            setQuestions(data.questions);
            console.log('Questions generated:', data.questions);
        } catch (error) {
            console.error('Error generating questions:', error);
        }
    };

    const handleQuestionsChange = (event) => {
        setNumQuestions(event.target.value);
        console.log(event.target.value);
    }

    const handleJobRoleChange = (e) => {
        setJobRole(e.target.value);
    };

    const handleQuestionTypesChange = (event, newValue) => {
        setQuestionTypes(newValue);
    };

    const handleGetStarted = () => {
        setShowQuickstart(false);
        // getting backend questions
        fetchQuestions();
    }

    const handleInterviewerDifficultyChange = (event) => {

    }


  return (
      <SignedIn>
        <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Page_Template title="Behavioral Interview Simulation" color="#2850d9">


              {/* --------- main content --------- */}
                  {showQuickstart ? (
                      <QuickstartPage
                          jobRole={jobRole}
                          numQuestions={numQuestions}
                          questionTypes={questionTypes}
                          handleJobRoleChange={handleJobRoleChange}
                          handleQuestionsChange={handleQuestionsChange}
                          handleQuestionTypesChange={handleQuestionTypesChange}
                          handleGetStarted={handleGetStarted}
                          handleInterviewerDifficultyChange={() => {}}
                          handleTimerChange={() => {}}
                      />
                  ) : (
                      <Box
                          component="main"
                          sx={{ flexGrow: 1, bgcolor: "black", height: "100vh", overflow: "auto" }}
                      >
                          <Toolbar />
                          {/* question box component */}
                          <Box component="main" sx={{ height: "90vh", overflow: "auto", textAlign: "center"}}>

                          {questions.length > 0 ? (
                                  <BehavioralSimulationPage questions={questions} />
                              ) : (
                                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 2}}>

                                      {/* loading */}
                                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%', width: '40%', flexDirection: 'column', gap: 2, borderRadius: 1, backgroundImage: 'url(/static/images/Loading.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                                          <CircularProgress />
                                          <Typography sx={{ fontFamily: 'DM Sans', color: '#F3F1EC'}}>Generating your simulation experience...</Typography>
                                      </Box>
                                  </Box>
                              )}
                          </Box>
                      </Box>
                  )}
            </Page_Template>  
        </Box>
    </SignedIn>
  );
}
