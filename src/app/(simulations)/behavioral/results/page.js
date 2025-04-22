"use client";

import CssBaseline from "@mui/material/CssBaseline";
import MainAppBar from "../../../../../components/MainAppBar";
import LeftNavbar from "../../../../../components/LeftNavbar";
import React from "react";
import { SignedIn } from "@clerk/nextjs";
import {Box, Typography} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import Image from "next/image";
import Link from "next/link";
import {initialTabs as tabs} from "@/app/(simulations)/behavioral/results/FeedbackTabs";
import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";

export default function InterviewResults() {
const [selectedTab, setSelectedTab] = useState(tabs[0]);

    const QuestionButton = ({ label }) => (
        <button
            className="
            rounded-2xl bg-gradient-to-r from-color6BAEDB to-colorACD9DB
            w-full text-color282523 font-satoshi font-bold shadow-[0_9px_#1d3557]
            text-black text-xl px-6 py-4 hover:from-color307999
            hover:to-color6EAFCC active:bg-color7DBE73
            active:shadow-[0_5px_#1d3557] active:translate-y-1 focus:outline-none
        ">
            {label}
        </button>
    );

    return(
            <SignedIn>
                <Box sx={{ display: "flex" }}>
                    <CssBaseline />

                    {/* ----------- title header div w/ user profile ----------- */}
                    <MainAppBar title="Behavioral Interview Simulation" color="#2850d9" />

                    {/* --------- sidebar navigation --------- */}
                    <LeftNavbar />
                    {/* --------- main content --------- */}
                    <Box
                        component="main"
                        sx={{ flexGrow: 1, bgcolor: '#F3F1EB', p: 4.5, height: '100vh', overflow: 'auto' }}
                    >
                        <Toolbar />
                        <Box>
                            <Typography color={"black"} fontFamily={"Satoshi Bold"} fontSize={"1.7rem"}>
                                Interview Results Summary
                            </Typography>
                            <Typography color={"black"} fontFamily={"DM Sans"} fontSize={"1rem"}>
                                This is a summary of your interview results. You can view the details of each question by clicking on the buttons below.
                            </Typography>
                        </Box>

                        <div className="flex flex-row justify-between w-full">

                            {/*  QUESTIONS BOX HALF */}
                            <Box className="w-[34%] pt-5  flex flex-col justify-between">

                                {/* buttons */}
                                <div className="flex flex-col space-y-5">
                                    <QuestionButton label={"Question 1"} />
                                    <QuestionButton label={"Question 2"} />
                                    <QuestionButton label={"Question 3"} />
                                    <QuestionButton label={"Question 4"} />
                                    <QuestionButton label={"Question 5"} />

                                </div>
                                {/* button */}
                                <div className='group flex justify-center items-center'>
                                    <Link href='/dashboard' className="bg-gradient-to-r from-[#98D781] to-[#7A9BE2] text-2xl font-dm-sans tracking-tight bg-colorFAF8F1 text-color282523 py-2 px-6 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-105 group-hover:-rotate-2">
                                        <span className='font-satoshi text-center text-2xl'>Dashboard</span>
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </Box>


                            {/* CONTENT BOX HALF */}
                            <div className="w-[65%] flex flex-col space-y-3 pt-5">

                                {/* gray box surrounding content box */}
                                <div className=" p-5 pt-5 rounded-3xl" style={{backgroundColor: "#D9D7D1"}}>
                                    <h2 className="text-color282523 font-satoshi text-2xl"> Question </h2>

                                    {/* content box */}
                                    <div className="w-120 h-200 rounded-2xl overflow-hidden shadow">

                                        {/* nav bar, header of content box */}
                                        <nav className=" font-dm-sans text-color282523 tracking-tight rounded-t-xl" style={{textAlign: "center"}}>
                                            <ul className="flex w-full space-x-1.5">
                                                {tabs.map((item) => (
                                                    <li
                                                        key={item.label}
                                                        className={`flex-1 min-w-0 p-3 relative cursor-pointer rounded-t-xl justify-between items-center font-bold text-xl ${item === selectedTab ? "bg-colorF3F1EA text-color6998C2" : "bg-colorB0B0B0"}`}
                                                        onClick={() => setSelectedTab(item)}
                                                    >
                                                        {`${item.icon} ${item.label}`}
                                                        {item === selectedTab && (
                                                            <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-colorB7B7B7 " layoutId="underline" />
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </nav>
                                        <main className="flex justify-center h-[600px] text-8xl flex-grow" style={{backgroundColor: "#F3F1EA"}}>
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={selectedTab ? selectedTab.label : "empty"}
                                                    initial={{ y: 10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -10, opacity: 0 }}
                                                    transition={{ duration: 0.12 }}
                                                    className="overflow-y-auto"
                                                >
                                                    <div className="text-center text-color282523 p-8 w-full" style={{fontSize: "18px", fontFamily: "DM Sans"}}>
                                                        {selectedTab ? selectedTab.content : "Select a tab to see the content."}
                                                    </div>
                                                </motion.div>
                                            </AnimatePresence>
                                        </main>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </Box>

                </Box>
            </SignedIn>
            )
        }

