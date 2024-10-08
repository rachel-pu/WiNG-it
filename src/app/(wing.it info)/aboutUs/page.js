const aboutUs = () => {
    return (
        // grid background
        <div className="relative h-screen w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center">

            {/* -------------------- first column --------------------*/}
            <div className="flex items-center justify-between w-full m-1/20">

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
                    <button className="text-2xl font-dm-sans tracking-tight bg-colorFAF8F1 text-color282523 py-2 px-8 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-105 group-hover:-rotate-2">
                        <span>I&apos;m Ready!</span>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>


        </div>
    )
}

export default aboutUs;