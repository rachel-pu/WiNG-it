import Image from "next/image";
import Link from 'next/link'

const AboutUs = () => {

    return (

        // grid background
        <div className="relative h-screen w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] ">

            {/* -------------------- first row --------------------*/}
            <div className="flex items-center justify-between w-full pt-1/50 pr-1/25 pl-1/25">

                {/* home & back button together*/}
                <div className='flex items-center space-x-10'>

                {/* back button */}
                <div className="group">
                    <Link href="/why-wing-it" className="relative h-16 w-16 bg-colorF3F1EA border-4 border-color282523 rounded-full flex items-center justify-center group-hover:bg-color282523 transition duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-color282523 group-hover:text-colorFAF8F1 transition duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                </div>

                {/* header text */}
                <h1 className="text-8xl font-dm-sans-black text-color282523 tracking-tighter">
                    About Us
                </h1>
                </div>

                {/* ready button */}
                <div className='group'>
                    <Link href='/dashboard' className="bg-gradient-to-r from-[#C8E2AF] to-[#6CBE20] text-2xl font-dm-sans tracking-tight bg-colorFAF8F1 text-color282523 py-2 px-12 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-105 group-hover:-rotate-2">
                        <span className='font-dm-sans-black'>I&apos;m Ready!</span>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* ----------------- about us text section ----------------- */}
            <div className='pl-1/9 pr-1/10 w-full space-y-6'>
                <p className="font-satoshi text-color282523 text-1.5xl leading-tight">
                    Our project was created for the
                    <span className="font-dm-sans-black tracking-tight"> University of Florida’s 🐊</span> first annual
                    <span className="font-dm-sans-black tracking-tight"> WiNGHacks Hackathon 🪽</span>, a hackathon designed to empower
                    women, non-binary, and gender minorities by providing them with a platform to innovate and create. Fun fact, that&apos;s where
                    our name, WiNG.it comes from. Our project won
                    <span className="font-dm-sans-black tracking-tight"> first place 🏆</span> for best project created by first time hackathoners and was picked up by
                    <span className="font-dm-sans-black tracking-tight"> UF Professor Amanpreet Kapoor  💻</span> to continue being built for improvement.
                </p>

                <p className="font-satoshi text-color282523 text-1.5xl leading-tight">
                    WiNG.it was created to help alleviate the stress that comes with preparing for interviews.
                    It didn&apos;t help that there aren&apos;t that many good, free-to-use resources out there.
                    As college students, we recognize the importance of being prepared for interviews and networking, as well as having easy access to resources.
                    We hope that with our application, we can help elevate that stress and push you to be the best version of yourself.

                </p>
            </div>

            {/* ----------------- developers section ----------------- */}
            <div className="flex justify-center space-x-[4%] items-center w-full mt-[2.5%] mb-[2.5%] ">

                {/* ----------------- rachel ----------------- */}
                <div className="flex flex-row justify-end w-1/2 items-center">
                    {/* rachel div text*/}
                    <div className=" flex justify-end pr-5 flex-col w-1/3">
                        <svg className="ml-[70%]" width="80" height="40" viewBox="0 0 156 56" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M3.99998 52.5C6.02093 50.3144 18.632 34.0592 34.1879 29.6093C46.2347 26.1631 59.6206 26.21 71.5011 30.3838C75.3596 31.7393 82.1324 35.3006 79.9973 40.5341C79.0224 42.9238 76.7045 44.0966 74.5102 45.2101C72.9866 45.9833 70.6661 46.8286 68.9682 46.1033C66.4295 45.0189 64.7111 41.9117 64.5937 39.2509C64.439 35.7427 66.5308 32.415 68.7462 29.8706C70.4192 27.9491 72.3633 26.3738 74.5499 25.0624C79.412 22.1464 84.7923 19.7864 90.3243 18.515C95.8318 17.2493 101.621 16.9695 107.243 17.4405C114.45 18.0441 120.997 20.4928 127.434 23.678C133.228 26.5455 138.742 29.9302 144.475 32.9122C145.228 33.3036 146.001 33.6551 146.747 34.0592C146.759 34.0659 147.619 34.4429 147.391 34.7138C146.78 35.4375 144.851 35.8704 144.055 36.1581C139.857 37.6758 135.7 39.2394 131.636 41.0978C128.71 42.4359 125.836 43.8887 123.049 45.4977C122.48 45.8266 124.25 45.0185 124.346 44.9773C130.666 42.2509 137.234 40.3551 143.888 38.6119C145.059 38.305 147.069 37.7838 148.285 37.4924C149.322 37.244 150.65 37.1544 151.647 36.7301C152.301 36.4519 149.804 34.1245 149.655 33.9387C146.703 30.2618 144.361 26.0767 141.996 22.0122C139.515 17.7465 137.494 13.4329 135.843 8.78583C135.612 8.13512 134.575 3.33449 133.528 3.63402"
                                stroke="black" stroke-width="7" stroke-linecap="round"/>
                        </svg>
                        <h2 className="font-dm-sans-black tracking-tight text-color282523 text-2.5xl text-right -mb-2">
                            Rachel Pu
                        </h2>
                        <p className="font-dm-sans-medium text-color282523 tracking-tight leading-tight text-right">
                            Student at UF majoring in
                            Computer Science and
                            minoring in Digital Arts & Sciences
                        </p>
                    </div>
                    <Image
                        src="/static/images/rachel%20pu%20image.png"
                        alt="rachel pu image"
                        width={280}
                        height={280}
                        unoptimized
                        className="border-color282523 border-4 rounded-2xl"
                    />
                </div>

                {/* ----------------- chelsea ----------------- */}
                <div className="flex flex-row justify-start w-1/2 items-center">
                    {/* chelsea div text*/}
                    <Image
                        src="/static/images/chelsea nguyen image.png"
                        alt="chelsea nguyen's image"
                        width={280}
                        height={280}
                        unoptimized
                        className="border-color282523 border-4 rounded-2xl"
                    />
                    <div className=" flex justify-end pl-5 flex-col w-1/3">
                        <svg className="mr-[75%]" width="80" height="40" viewBox="0 0 160 81" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M156.5 77.0683C154.41 74.8293 159.5 47.9643 124.573 31.436C112.186 27.8405 98.4507 27.7896 86.2908 31.9493C82.3414 33.3003 75.4181 36.8744 77.6474 42.2157C78.6654 44.6548 81.0524 45.8653 83.3122 47.0145C84.8813 47.8125 87.2686 48.6898 89.0055 47.9643C91.6025 46.8795 93.3429 43.7303 93.4438 41.0234C93.5767 37.4546 91.4058 34.0529 89.1138 31.4474C87.3829 29.4798 85.3765 27.8624 83.1231 26.5118C78.1125 23.5086 72.5744 21.0674 66.8886 19.7329C61.228 18.4043 55.2856 18.077 49.5198 18.5148C42.1294 19.076 35.4292 21.5196 28.8482 24.7135C22.9236 27.5887 17.2903 30.9925 11.43 33.9847C10.6607 34.3775 9.86975 34.7294 9.1074 35.1352C9.09475 35.1419 8.21484 35.5192 8.45132 35.7966C9.08297 36.5375 11.0659 36.9922 11.8847 37.2908C16.2038 38.8662 20.4808 40.488 24.6644 42.409C27.6769 43.7922 30.6364 45.2918 33.5077 46.9496C34.0948 47.2885 32.272 46.4532 32.1737 46.4105C25.6681 43.5896 18.9151 41.612 12.0745 39.7891C10.8699 39.4681 8.80368 38.923 7.55391 38.6175C6.48865 38.3571 5.12525 38.2561 4.09873 37.817C3.42585 37.5291 5.97025 35.1791 6.12197 34.9911C9.12405 31.2712 11.4965 27.0298 13.8929 22.9111C16.408 18.5885 18.4498 14.2139 20.1097 9.49715C20.3421 8.83669 21.371 3.95918 22.4476 4.27169"
                                stroke="black" stroke-width="7" stroke-linecap="round"/>
                        </svg>
                        <h2 className="font-dm-sans-black tracking-tight text-color282523 text-2xl text-left -mb-1">
                            Chelsea Nguyen
                        </h2>
                        <p className="font-dm-sans-medium text-color282523 tracking-tight leading-tight text-left">
                            Student at UF majoring in
                            Computer Science and
                            minoring in Digital Arts & Sciences
                        </p>
                    </div>

                </div>
            </div>

            {/* ----------------- honorable mention text section ----------------- */}
            <div className='pl-1/9 pr-1/10 w-full space-y-6'>
                <p className="font-satoshi text-color282523 text-1.5xl text-center leading-tight">
                    Honorable developers who contributed in building the original project during WiNGHacks:
                    <span className="font-dm-sans-black tracking-tight"> Xiaguo Jia</span>,
                    <span className="font-dm-sans-black tracking-tight"> Sara Smith</span>
                </p>
            </div>
        </div>
)
}

export default AboutUs;