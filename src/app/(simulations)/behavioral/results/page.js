"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialTabs as tabs } from './ingredients';
import Link from "next/link";
import Image from "next/image";

export default function Results() {
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

    return (
        // background grid
        <div className="relative h-screen w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center">

            {/* Results */}
            <div className="flex flex-row justify-between w-full h-screen">

                {/*  QUESTIONS BOX HALF */}
                <div className="w-[40%]  p-16">

                    {/* stars*/}
                    <Image alt={"stars"} src="/static/images/star_group.svg" width={450} height={450} />

                    {/* header */}
                    <h1 className="text-5xl text-color282523 font-dm-sans-black tracking-tighter">
                        Questions
                    </h1>
                    {/* buttons */}
                    <div className="flex flex-col space-y-5">
                    <QuestionButton label={"Question 1"} />
                        <QuestionButton label={"Question 2"} />
                        <QuestionButton label={"Question 3"} />
                        <QuestionButton label={"Question 4"} />
                        <QuestionButton label={"Question 5"} />
                    </div>
                </div>


            {/* CONTENT BOX HALF */}
            <div className="w-[60%] flex flex-col space-y-3 pr-1/25 pt-10">

                <div className="flex flex-row justify-between">
                {/* evaluation title */}
                <div>
                    <h1 className="text-5xl text-color282523 font-dm-sans-black tracking-tighter">
                        Evaluation
                    </h1>
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

                </div>

            {/* gray box surrounding content box */}
            <div className="bg-gradient-to-b from-colorD9D9D9 to-colorB7B7B7 p-5 pt-5 rounded-3xl">
                <h2 className="text-color282523 font-satoshi text-2xl"> Question </h2>

                {/* content box */}
            <div className="w-120 h-200 rounded-2xl overflow-hidden shadow">

                {/* nav bar, header of content box */}
                <nav className=" font-dm-sans-medium text-color282523 tracking-tight rounded-t-xl ">
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
                <main className="flex justify-center bg-colorF3F1EA h-[600px] text-8xl flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedTab ? selectedTab.label : "empty"}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="overflow-y-auto"
                        >
                            <div className="text-center text-color282523 text-xl p-8 font-satoshi w-full">
                                {selectedTab ? selectedTab.content : "Select a tab to see the content."}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            </div>
            </div>
            </div>
        </div>
    );
}
