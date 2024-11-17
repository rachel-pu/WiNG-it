import Link from "next/link";
import Image from "next/image";


const MainDashboard = () => {
    return (
        <div className="flex h-screen w-full">

            {/* --------------------- vertical navbar --------------------- */}
            <div className="bg-color282523 w-60 min-h-screen flex flex-col justify-between p-5">
                <div>
                    <h1 className="text-xl font-dm-sans-black tracking-tighter text-white mb-5">Navigation</h1>
                    <ul className="flex flex-col">
                        <li className="mb-3">
                            <Link href="/dashboard">
                                <p className="text-white">Dashboard</p>
                            </Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/transcripts">
                                <p className="text-white">Transcripts</p>
                            </Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/settings">
                                <p className="text-white">Settings</p>
                            </Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/profile">
                                <p className="text-white">Profile</p>
                            </Link>
                        </li>
                        {/* Add more navigation items here */}
                    </ul>
                </div>
                <div>
                    <p className="text-white text-sm font-satoshi">© 2023 Your Company</p>
                </div>
            </div>

            {/* --------------------- main background ---------------------*/}
            <div className="relative flex-col h-full w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center ">

            {/* --------------------- first column --------------------- */}
            <div className="flex max-w-6xl items-center justify-between w-full pt-1/50 pr-1/25 pl-1/25">
                {/* title */}
                <h1 className="text-7xl font-dm-sans-black text-color282523 tracking-tighter">
                    Dashboard
                </h1>

                {/* date and time text */}
                <div className="flex flex-col">
                    {/* time */}
                    <div className="-mb-3">
                        <span className="font-bold font-dm-sans text-color282523 text-2xl tracking-tight"> 11:21 AM </span>
                    </div>

                    {/* date */}
                    <div>
                        <span className="font-dm-sans-medium text-color282523 text-2xl tracking-tight">Date:</span>
                        <span className="font-dm-sans text-color282523 text-2xl tracking-tight"> 2021-09-01</span>
                    </div>
                </div>

            </div>

            {/* --------------------- grid of options --------------------- */}
            <div className="grid grid-cols-2 gap-10 px-10 w-full max-w-6xl">

                {/* behavioral interview  */}
                <div className="bg-gradient-to-b from-color6998C2 to-color3163C7 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between hover:scale-105 transition-transform duration-300 transform hover:cursor-pointer">
                        <h2 className="mb-3 leading-10 text-4xl font-semibold text-colorF3F1EA font-dm-sans-black tracking-tighter">
                            Behavioral Interview Simulator</h2>
                        <p className = "text-colorF3F1EA font-satoshi leading-tight">
                            This mode allows you to practice behavioral interviews with personalized advice at the end.</p>
                </div>

                {/* recruiter practice*/}
                <div className="bg-gradient-to-b from-color73842F to-color8BCA67 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between hover:scale-105 transition-transform duration-300 transform hover:cursor-pointer">
                    <h2 className=" leading-10 text-4xl font-semibold text-colorF3F1EA font-dm-sans-black tracking-tighter">
                        Recruiter Simulator</h2>
                    <p className = " text-colorF3F1EA font-satoshi leading-tight">
                        This mode allows you to practice getting comfortable talking to recruiters during job conferences.</p>
                </div>

                {/* webscraper (need better name) */}
                <div className="bg-gradient-to-b from-color6998C2 to-color3163C7 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between hover:scale-105 transition-transform duration-300 transform hover:cursor-pointer">
                    <h2 className="mb-3 leading-10 text-4xl font-semibold text-colorF3F1EA font-dm-sans-black tracking-tighter">
                        Webscraper</h2>
                    <p className = "text-colorF3F1EA font-satoshi leading-tight">
                        This mode allows you to practice getting comfortable talking to recruiters during job conferences.</p>
                </div>

                {/* to be continued */}
                <div className="bg-gradient-to-b from-color6998C2 to-color3163C7 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between hover:scale-105 transition-transform duration-300 transform hover:cursor-pointer">

                </div>
            </div>
        </div>
        </div>
    )

}

export default MainDashboard;