
import InterviewQuestions from "../../../../components/InterviewQuestions";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { SignedIn } from "@clerk/nextjs";
import CssBaseline from "@mui/material/CssBaseline";
import MainAppBar from "../../../../components/MainAppBar";
import LeftNavbar from "../../../../components/LeftNavbar";
import React from "react";
import Typography from "@mui/material/Typography";

export default function TestingPage() {

    return (

    <main className="flex items-center justify-center min-h-screen bg-white">
      <InterviewQuestions />
    </main>

    );
}