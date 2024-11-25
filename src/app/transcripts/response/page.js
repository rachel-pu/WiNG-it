import Link from "next/link";
import Image from "next/image";
import Navigation from "/components/navigation";

const BehavioralInterviewTranscripts = () => {
    return (
        <div className="flex h-screen w-full">

            {/*/!* --------------------- vertical navbar --------------------- *!/*/}
            <Navigation/>

            {/* --------------------- main background ---------------------*/}
            <div
                className="relative flex-col h-full w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center ">

                {/* --------------------- first column --------------------- */}
                <div className="grid grid-rows-2 max-w-6xl items-center justify-between w-full pt-1/50 pr-1/25 pl-1/25">
                    {/* title */}
                    <h1 className="text-6xl font-dm-sans-black text-color282523 tracking-tighter">
                        Behavioral Interview Responses
                    </h1>
                    <p className="text-4xl font-dm-sans text-color282523 tracking-tighter">
                        Suggestions for Improvement:
                    </p>

                </div>

                {/* --------------------- grid of options --------------------- */}
                <div className=" gap-10 px-10 w-full max-w-6xl">

                    {/* behavioral interview  */}
                    <div
                        className="relative bg-gradient-to-b from-color6998C2 to-color3163C7 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between">
                        <div className="flex justify-center items-center h-full group">
                            <Link href='../response'
                                  className="text-2xl font-dm-sans tracking-tight mt-10 bg-colorFAF8F1 text-color282523 py-3 px-1/20 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-105 group-hover:-rotate-2">
                                <span>I&apos;m Ready!</span>

                            </Link>
                        </div>
                        <h2 className="mb-3 leading-10 text-4xl font-semibold text-colorF3F1EA font-dm-sans-black tracking-tighter">


                        </h2>
                        {/*<p className="text-colorF3F1EA font-sat oshi leading-tight text-2.5xl">*/}
                        {/*    Your average score: </p>*/}

                        {/*/!*-----------------button--------------------*!/*/}
                        {/*<div className="absolute bottom-6 right-6 group">*/}
                        {/*    <Link href='./behavioral-interview-transcripts'*/}
                        {/*          className="bg-gradient-to-r from-[#C8E2AF] to-[#6CBE20] text-2xl font-dm-sans tracking-tight text-color282523 py-2 px-8 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-102 group-hover:-rotate-1">*/}
                        {/*        <span className="font-dm-sans-black">See Responses</span>*/}
                        {/*        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3"*/}
                        {/*             viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">*/}
                        {/*            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7"/>*/}
                        {/*        </svg>*/}
                        {/*    </Link>*/}
                        {/*</div>*/}


                    </div>

                </div>
            </div>
        </div>
    )

}

export default BehavioralInterviewTranscripts;