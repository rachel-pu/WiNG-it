import Link from "next/link";
import Image from "next/image";
import LeftNavbar from '/components/leftNavbar';


const Transcripts = () => {
    return (
        <div className="flex h-screen w-full">

            {/*/!* --------------------- vertical navbar --------------------- *!/*/}
            <LeftNavbar/>

            {/* --------------------- main background ---------------------*/}
            <div
                className="relative flex-col h-full w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center ">

                {/* --------------------- first column --------------------- */}
                <div className="grid grid-rows-2 max-w-6xl items-center justify-between w-full pt-1/50 pr-1/25 pl-1/25">
                    {/* title */}
                    <h1 className="text-7xl font-dm-sans-black text-color282523 tracking-tighter">
                        Transcripts
                    </h1>
                    <p className="text-2xl font-dm-sans text-color282523 tracking-tighter">
                        Here, you can review your saved responses from the behavioral interview and recruiter
                        simulators. Remember practice makes perfect! :)
                    </p>

                </div>

                {/* --------------------- grid of options --------------------- */}
                <div className="grid grid-rows-2 gap-10 px-10 w-full max-w-6xl">

                    {/* behavioral interview  */}
                    <div
                        className="relative bg-gradient-to-b from-color6998C2 to-color3163C7 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between">
                        <h2 className="mb-3 leading-10 text-4xl font-semibold text-colorF3F1EA font-dm-sans-black tracking-tighter">
                            Behavioral Interview Simulator Responses</h2>
                        <p className="text-colorF3F1EA font-sat oshi leading-tight text-2.5xl">
                            Your average score: </p>

                        {/*-----------------button--------------------*/}
                        <div className="absolute bottom-6 right-6 group">
                            <Link href='transcripts/behavioral-interview-transcripts'
                                  className="bg-gradient-to-r from-[#C8E2AF] to-[#6CBE20] text-2xl font-dm-sans tracking-tight text-color282523 py-2 px-8 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-102 group-hover:-rotate-1">
                                <span className="font-dm-sans-black">See Responses</span>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3"
                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7"/>
                                </svg>
                            </Link>
                        </div>


                    </div>

                    {/* instructions practice*/}
                    <div
                        className="relative bg-gradient-to-b from-color6998C2 to-color8BCA67 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between">
                        <h2 className=" leading-10 text-4xl font-semibold text-colorF3F1EA font-dm-sans-black tracking-tighter">
                            Recruiter Simulator Responses</h2>
                        <p className="text-colorF3F1EA font-satoshi leading-tight text-2.5xl">
                            Your average score: </p>

                        {/*-----------------button--------------------*/}
                        <div className="absolute bottom-6 right-6 group">
                            <Link href='./recruiter-responses'
                                  className="bg-gradient-to-r from-[#C8E2AF] to-[#6CBE20] text-2xl font-dm-sans tracking-tight text-color282523 py-2 px-8 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-102 group-hover:-rotate-1">
                                <span className="font-dm-sans-black">See Responses</span>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3"
                                     viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7"/>
                                </svg>
                            </Link>
                        </div>


                    </div>

                    {/*/!* webscraper (need better name) *!/*/}
                    {/*<div className="bg-gradient-to-b from-color6998C2 to-color3163C7 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between hover:scale-105 transition-transform duration-300 transform hover:cursor-pointer">*/}
                    {/*    <h2 className="mb-3 leading-10 text-4xl font-semibold text-colorF3F1EA font-dm-sans-black tracking-tighter">*/}
                    {/*        Webscraper</h2>*/}
                    {/*    <p className = "text-colorF3F1EA font-satoshi leading-tight">*/}
                    {/*        This mode allows you to practice getting comfortable talking to recruiters during job conferences.</p>*/}
                    {/*</div>*/}

                    {/* to be continued */}
                    {/*<div*/}
                    {/*    className="bg-gradient-to-b from-color6998C2 to-color3163C7 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between hover:scale-105 transition-transform duration-300 transform hover:cursor-pointer">*/}

                    {/*</div>*/}
                </div>
            </div>
        </div>
    )

}

export default Transcripts;