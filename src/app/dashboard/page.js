import Link from "next/link";
import Image from "next/image";
import Navigation from "/components/navigation";


const MainDashboard = () => {
    return (
        <div className="flex h-screen w-full">

            <Navigation/>

            {/* --------------------- main background ---------------------*/}
            <div className="relative flex-col h-full w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center ">

            {/* --------------------- first row --------------------- */}
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
            <div className="pt-1/50 pl-1/20 pr-1/20 h-screen">
                <div  className="grid grid-cols-2 gap-1/15 px-10">

                {/* behavioral interview  */}
                <Link href = "/behavioral-instructions "className="bg-gradient-to-br from-color3163C7 to-color7489B2 p-6 rounded-xl shadow-lg hover:shadow-2xl transition hover:scale-105  duration-300 transform hover:cursor-pointer">
                    <div className="leading-tight">
                        <h2 className="text-white text-3xl font-dm-sans-black tracking-tight font-bold mb-2">Behavioral Interview Simulator</h2>
                        <p className="text-white text-lg font-satoshi text-opacity-90">This mode allows you to practice behavioral interviews
                            with personalized advice at the end.</p>
                    </div>
                    <Image
                        src={'/static/images/image 7.png'}
                        alt={"Behavioral Interview Simulator"}
                        width={1000}
                        height={100}
                        className=" mt-1/25 max-w-full rounded-xl"/>

                </Link>

                {/* recruiter practice*/}
                <div className="bg-gradient-to-br from-color8DA877 to-color8BCA67 p-6 rounded-xl shadow-lg hover:shadow-2xl transition hover:scale-105  duration-300 transform hover:cursor-pointer">
                        <div className="leading-tight">
                            <h2 className="text-white text-3xl font-dm-sans-black tracking-tight font-bold mb-2">Recruiter Practice</h2>
                            <p className="text-white text-lg font-satoshi text-opacity-90">This mode allows you to practice behavioral interviews
                                with personalized advice at the end.</p>
                        </div>
                        <Image
                            src={'/static/images/image 7.png'}
                            alt={"Behavioral Interview Simulator"}
                            width={1000}
                            height={100}
                            className=" mt-1/25 max-w-full rounded-xl"/>

                    </div>

                {/* webscraping mode*/}
                <div className="bg-gradient-to-br from-colorAED6EC to-colorC1B1E1 p-6 rounded-xl shadow-lg hover:shadow-2xl transition hover:scale-105  duration-300 transform hover:cursor-pointer">
                        <div className="leading-tight">
                            <h2 className="text-white text-3xl font-dm-sans-black tracking-tight font-bold mb-2">Behavioral Interview Simulator</h2>
                            <p className="text-white text-lg font-satoshi text-opacity-90">This mode allows you to practice behavioral interviews
                                with personalized advice at the end.</p>
                        </div>
                        <Image
                            src={'/static/images/image 7.png'}
                            alt={"Behavioral Interview Simulator"}
                            width={1000}
                            height={100}
                            className=" mt-1/25 max-w-full rounded-xl"/>

                    </div>

                {/* to be continued */}
                <div className="bg-gradient-to-br from-color7489B2 to-colorF3F1EA p-6 rounded-xl shadow-lg ">


                    </div>


                </div>
            </div>
        </div>
        </div>
    )

}

export default MainDashboard;