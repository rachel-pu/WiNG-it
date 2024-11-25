"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialTabs as tabs } from './ingredients'; // Ensure the import path is correct

export default function Results() {
    const [selectedTab, setSelectedTab] = useState(tabs[0]);

    return (
        // background grid
        <div className="relative h-screen w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center">


            <div className="flex flex-row space-x-1/5">
            {/*  questions buttons  */}
                <div className="bg-color7489B2">
                    <h2> questions </h2>
                </div>

            {/* gray box surrounding content box */}
            <div className="bg-gradient-to-b from-colorD9D9D9 to-colorB7B7B7 p-4 pt-5 rounded-3xl">
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
                <main className="flex justify-center bg-colorF3F1EA  items-center text-8xl flex-grow select-none">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedTab ? selectedTab.label : "empty"}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-center text-color282523 text-xl p-10 max-w-prose">
                                {selectedTab ? selectedTab.content : "Select a tab to see the content."}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            </div>
            </div>
        </div>
    );
}
