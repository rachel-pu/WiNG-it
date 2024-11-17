// const whyWiNGit = () => {
//     return (
//         <div>
//             <div>
//                 <div className="absolute top-5 left-5 w-4 h-4 bg-color8DA877 rounded-full"></div>
//                 <div className="absolute top-5 right-5 w-4 h-4 bg-color7489B2 rounded-full"></div>
//                 <div className="absolute bottom-5 left-5 w-4 h-4 bg-color8DA877 rounded-full"></div>
//                 <div className="absolute bottom-5 right-5 w-4 h-4 bg-color7489B2 rounded-full"></div>
//             </div>
//
//             <div className="text-color282523 pl-1/20 mb-1/25">
//                 <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl -mb-1/15 mt-1/25 font-dm-sans-semibold tracking-tighter">
//                     Are you ready to
//                 </h2>
//                 <h1 className="text-13xl -mb-1/15 -ml-1/100 font-dm-sans-black tracking-tighter">
//                     WiNG.it
//                 </h1>
//                 <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-dm-sans-semibold tracking-tighter">
//                     so you don&apos;t need to wing it?
//                 </p>
//             </div>
//             <p className="text-color282523 text-2xl tracking-tight mb-8 text-center font-satoshi">
//                 It&apos;s time to start practicing being
//                 <span className="font-dm-sans-black "> W</span>ell-prepared for
//                 <span className="font-dm-sans-black "> I</span>nterviews,
//                 <span className="font-dm-sans-black "> N</span>etworking, and being
//                 <span className="font-dm-sans-black "> G</span>reat!
//             </p>
//         </div>
//     );
// }
//
// export default whyWiNGit;


import aboutUs from "@/app/(wing.it info)/about-us/page";

const whyWiNGit = () => {
    return (
        // Grid background similar to your provided image
        <div
            className="relative h-screen w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex flex-col justify-center items-center space-y-6 px-8 text-center">

            {/* -------------------- Header and Back Button -------------------- */}
            <div className="flex items-center space-x-4 justify-start w-full max-w-4xl">
                {/* Back Button */}
                {/*<div className="group">*/}
                {/*    <button*/}
                {/*        className="relative h-16 w-16 bg-colorF3F1EA border-4 border-color282523 rounded-full flex items-center justify-center group-hover:bg-color282523 transition duration-300">*/}
                {/*        <svg xmlns="http://www.w3.org/2000/svg"*/}
                {/*             className="h-10 w-10 group-hover:text-colorFAF8F1 transition duration-300"*/}
                {/*             fill="none" viewBox="0 0 24 24" stroke="currentColor">*/}
                {/*            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>*/}
                {/*        </svg>*/}
                {/*    </button>*/}
                {/*</div>*/}

                <div className="group">
                    <button
                        className="relative h-16 w-16 bg-colorF3F1EA border-4 border-color282523 rounded-full flex items-center justify-center group-hover:bg-color282523 transition duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             className="h-10 w-10 text-color282523 group-hover:text-colorFAF8F1 transition duration-300"
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                </div>

                {/* Header */}
                <h1 className="text-8xl font-dm-sans-black text-color282523 tracking-tighter flex items-center space-x-2">
                    Why WiNG.it?
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                         stroke="currentColor" className="h-20 w-20">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/>
                    </svg>
                </h1>
            </div>

            {/* -------------------- Main Text Section -------------------- */}
            <div className="text-left max-w-7xl">
                <p className="text-3xl font-dm-sans text-color282523 mb-4">
                    As students, we know interviewing and networking is hard. Like... <span
                    className="italic">really</span> hard. And unfortunately, there are close to zero good, free, and
                    useful career preparation simulations out there.
                </p>
                <p className="text-3xl font-dm-sans-black text-color282523 mb-8">
                    Our goal? <span
                    className="font-bold">Making career preparation more accessible for all students.</span> No paywall.
                    No fees. Just practicing for your upcoming opportunities and needs.
                </p>
                <p className="text-3xl font-dm-sans text-color282523">
                    Oh, and as a bonus, making it fun. <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                                                            className="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"/>
                </svg>

                </p>
            </div>

            {/* -------------------- "Who are we?" Button -------------------- */}
            <div className="group">
                <button
                    className="text-4xl font-dm-sans-semibold tracking-tight bg-gradient-to-r from-color8BCA67 to-color5C9CF5 text-black py-2 px-6 rounded-full shadow-lg transition-transform duration-300 transform group-hover:scale-105 group-hover:-rotate-2">
                    Who are we?
                </button>
            </div>
        </div>
    );
}

export default whyWiNGit;
