import Image from "next/image";

const aboutUs = () => {
    return (
        // grid background
        <div className="relative h-screen w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] ">

            {/* -------------------- first column --------------------*/}
            <div className="flex items-center justify-between w-full pt-1/50 pr-1/25 pl-1/25">

                {/* home & back button together*/}
                <div className='flex items-center space-x-10'>

                {/* back button */}
                <div className="group">
                    <button className="relative h-16 w-16 bg-colorF3F1EA border-4 border-color282523 rounded-full flex items-center justify-center group-hover:bg-color282523 transition duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-color282523 group-hover:text-colorFAF8F1 transition duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* header text */}
                <h1 className="text-8xl font-dm-sans-black text-color282523 tracking-tighter">
                    About Us
                </h1>
                </div>

                {/* ready button */}
                <div className='group'>
                    <button className="text-2xl font-dm-sans tracking-tight bg-colorFAF8F1 text-color282523 py-3 px-12 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-105 group-hover:-rotate-2">
                        <span>I&apos;m Ready!</span>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ----------------- about us text section ----------------- */}
            <div className='pl-1/9 pr-1/10 w-full'>
                <p className="font-satoshi text-color282523 text-1.5xl leading-tight">
                    Our project was created for the
                    <span className="font-dm-sans-black tracking-tight"> University of Florida’s 🐊</span> first annual
                    <span className="font-dm-sans-black tracking-tight"> WiNGHacks Hackathon 🪽</span>, a hackathon designed to empower
                    women, non-binary, and gender minorities by providing them with a platform to innovate and create. Our project won
                    <span className="font-dm-sans-black tracking-tight"> first place 🏆</span> for best project created by first time hackathoners and was picked up by
                    <span className="font-dm-sans-black tracking-tight"> UF Professor Amanpreet Kapoor  💻</span> to continue being built for improvement.
                </p>
            </div>

            {/* ----------------- images section ----------------- */}
            <div className="flex justify-center space-x-10 items-center w-full h-1/2 bg-color5C9CF5">

                {/* ----------------- rachel ----------------- */}
                <div className="flex  justify-center  w-1/2 items-center bg-colorCDE1B1">
                    {/* rachel text*/}
                    <div className="flex flex-col items-center justify-center w-3/8 bg-color5C9CF5">
                        <h2 className="font-satoshi font-bold text-color282523 text-xl">
                            Rachel Pu
                        </h2>
                        <p className="font-dm-sans text-color282523">
                            Student at UF majoring in
                            Computer Science and
                            minoring in Digital Arts & Sciences
                        </p>
                    </div>
                    <Image
                        src="/static/images/rachel%20pu%20image.png"
                        alt="rachel pu image"
                        width={100}
                        height={100}
                        unoptimized
                        className="w-full h-full" />
                </div>
            <div>
                    <Image src="/static/images/chelsea%20nguyen%20image.png"
                           alt="chelsea nguyen image"
                           width={200}
                           height={200}
                           unoptimized
                           className="w-full h-full" />
            </div>
            </div>

        </div>
    )
}

export default aboutUs;