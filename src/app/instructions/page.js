"use client";
import Image from "next/image";
import Link from "next/link";


const Instructions = () => {
  return (
      // background grid
      <div className="relative h-screen w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center">

          {/* main content box */}
          <div
              className="mx-auto bg-gradient-to-r from-color6795CA/70 via-colorC1B1E1/70 to-colorAED6EC/70 w-4/5 h-10/12 p-20 rounded-3xl shadow-lg relative">

              {/* ----------------- dots in corner ----------------*/}
              <div>
                  {/* Top-left dot */}
                  <div className="absolute top-5 left-5 w-4 h-4 bg-color31362F/25 rounded-full"></div>

                  {/* Top-right dot */}
                  <div className="absolute top-5 right-5 w-4 h-4 bg-color31362F/25 rounded-full"></div>

                  {/* Bottom-left dot */}
                  <div className="absolute bottom-5 left-5 w-4 h-4 bg-color31362F/25 rounded-full"></div>

                  {/* Bottom-right dot */}
                  <div className="absolute bottom-5 right-5 w-4 h-4 bg-color31362F/25 rounded-full"></div>
              </div>

              {/* ----------------- title text ----------------- */}
              <div className="text-color282523 flex justify-center items-center">
                  {/*sub-title */}
                  {/*<h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl -mb-1/15 mt-1/25 font-dm-sans-semibold tracking-tighter">*/}
                  {/*    Are you ready to*/}
                  {/*</h2>*/}
                  {/* title */}
                  <h1 className="text-7xl font-dm-sans-black tracking-tighter">
                      Behavioral Interview Simulator
                  </h1>

                  {/* sub-title */}
                  {/*<p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-dm-sans-semibold tracking-tighter">*/}
                  {/*    so you don&apos;t need to wing it?*/}
                  {/*</p>*/}
              </div>

              {/* ----------------- subtext ----------------- */}
              <p className="text-color282523 text-2xl tracking-tight mb-8 text-left pl-16 font-satoshi">
                  This is a simulation specifically to help you practice for behavioral interviews.


                  {/*It&apos;s time to start practicing being*/}
                  {/*<span className="font-dm-sans-black "> W</span>ell-prepared for*/}
                  {/*<span className="font-dm-sans-black "> I</span>nterviews,*/}
                  {/*<span className="font-dm-sans-black "> N</span>etworking, and being*/}
                  {/*<span className="font-dm-sans-black "> G</span>reat!*/}
              </p>
              <ul className="list-disc pl-24 pb-24 text-color282523 text-2xl tracking-tight text-left font-satoshi">
                  <li>This is a practice tool, not a real representation of how you will do.</li>
                  <li>No skipping allowed! Just answer to the best of your ability.</li>
                  <li>You can exit at any point of the simulator, but you will not get your results nor will your
                      progress be saved.
                  </li>
                  <li>You will answer
                      <span
                          className="bg-colorFAF8F1 text-color282523 font-semibold px-2 py-1 rounded-md ml-2 shadow-lg relative">4 questions</span>
                  </li>
                  <li>Once you hit the microphone button, you cannot turn it off.</li>
                  <li>Please take this as a realistic practice opportunity.</li>
              </ul>

              {/* ----------------- button ----------------- */}
              <div className="flex justify-center items-center h-full group">
                  <Link href='/dashboard'
                        className="text-4xl font-dm-sans tracking-tight mt-10 bg-colorFAF8F1 text-color282523 py-3 px-1/20 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-105 group-hover:-rotate-2">
                      <span>I&apos;m Ready!</span>
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"
                           xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7"/>
                      </svg>
                  </Link>
              </div>
          </div>
      </div>
  );
}

export default Instructions;