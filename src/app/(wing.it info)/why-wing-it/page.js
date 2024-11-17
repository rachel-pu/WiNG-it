import Link from "next/link";
import Image from "next/image";

const whyWiNGit = () => {
    return (
        <div className="relative h-screen w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] ">

            {/* -------------------- Header and Back Button -------------------- */}
            <div className="flex items-center justify-between w-full pt-1/50 pr-1/25 pl-1/25">

                {/* home & back button together*/}
                <div className='flex items-center space-x-10'>

                    {/* back button */}
                    <div className="group">
                        <Link href="/" className="relative h-16 w-16 bg-colorF3F1EA border-4 border-color282523 rounded-full flex items-center justify-center group-hover:bg-color282523 transition duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-color282523 group-hover:text-colorFAF8F1 transition duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                    </div>

                    {/* header text */}
                    <h1 className="text-8xl font-dm-sans-black text-color282523 tracking-tighter">
                        Why WiNG.it?
                    </h1>
                </div>

            </div>

            {/* -------------------- Main Text Section -------------------- */}
            <div className="text-left pl-1/9 pr-1/8 pb-1/50">
                <p className="text-2.5xl font-satoshi text-color282523 mb-4 leading-tight">
                    As students, we know interviewing and networking can be hard. Like... <span
                    className="italic font-bold">really</span> hard. And unfortunately, there are close to zero good, free, and
                    useful career preparation simulations out there.
                </p>
                <p className="text-2.5xl font-satoshi text-color282523 mb-8 leading-tight">
                    Our goal? <span
                    className="font-dm-sans-black tracking-tight">Making career preparation more accessible for all students.</span> No paywall.
                    No fees. Just practicing for your upcoming opportunities and needs.
                </p>
                <p className="text-2.5xl font-satoshi text-color282523 leading-tight">
                    Oh, and as a bonus, making it fun. Because who said preparing for your future can&apos;t be fun?
                </p>
            </div>

            {/* -------------------- image ---------------------- */}
            <Image
                src="/static/images/templates & apps.png"
                alt="rachel pu image"
                width={500}
                height={500}
                unoptimized
                className="rounded-2xl mx-auto mb-1/50"
            />

            {/* -------------------- "Who are we?" Button -------------------- */}
            <div className='group flex justify-center items-center w-full'>
                <Link href='/about-us' className="bg-gradient-to-r from-[#98D781] to-[#7A9BE2] text-2xl font-dm-sans tracking-tight bg-colorFAF8F1 text-color282523 py-2 px-6 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-105 group-hover:-rotate-2">
                    <span className='font-satoshi text-center text-2.5xl'>Who are we?</span>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}

export default whyWiNGit;
