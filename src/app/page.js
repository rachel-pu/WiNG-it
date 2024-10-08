import Image from "next/image";

export default function Home() {
  return (
      // background grid
      <div className="relative h-screen w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center">

          {/* main content box */}
          <div className="mx-auto bg-gradient-to-r from-color8BCA67/50 via-colorBDE3E3/50 to-color5C9CF5/50 w-4/5 h-11/12 p-20 rounded-3xl shadow-lg relative">

              {/* ----------------- dots in corner ----------------*/}
              <div>
                  {/* Top-left dot */}
                  <div className="absolute top-5 left-5 w-4 h-4 bg-color8DA877 rounded-full"></div>

                  {/* Top-right dot */}
                  <div className="absolute top-5 right-5 w-4 h-4 bg-color7489B2 rounded-full"></div>

                  {/* Bottom-left dot */}
                  <div className="absolute bottom-5 left-5 w-4 h-4 bg-color8DA877 rounded-full"></div>

                  {/* Bottom-right dot */}
                  <div className="absolute bottom-5 right-5 w-4 h-4 bg-color7489B2 rounded-full"></div>
              </div>

              {/* ----------------- sticky note section ----------------- */}
              <div className="absolute top-30 right-20">
                  <Image
                      src={'/static/images/about us yellow sticky note.png'}
                      alt={"test"}
                      width={250}
                      height={250}
                      className="hover:rotate-6 transition-transform duration-300 transform hover:cursor-pointer"
                  />
              </div>

              {/* ----------------- title text ----------------- */}
              <div className="text-color282523 pl-1/20 mb-1/25">
                  {/* sub-title */}
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl -mb-1/15 mt-1/25 font-dm-sans-semibold tracking-tighter">
                      Are you ready to
                  </h2>
                  {/* title */}
                  <h1 className="text-13xl -mb-1/15 -ml-1/100 font-dm-sans-black tracking-tighter">
                      WiNG.it
                  </h1>

                  {/* sub-title */}
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-dm-sans-semibold tracking-tighter">
                      so you don&apos;t need to wing it?
                  </p>
              </div>

              {/* ----------------- subtext ----------------- */}
              <p className="text-color282523 text-2xl tracking-tight mb-8 text-center font-satoshi">
                  It&apos;s time to start practicing being
                  <span className="font-dm-sans-black "> W</span>ell-prepared for
                  <span className="font-dm-sans-black "> I</span>nterviews,
                  <span className="font-dm-sans-black "> N</span>etworking, and being
                  <span className="font-dm-sans-black "> G</span>reat!
              </p>

              {/* ----------------- button ----------------- */}
              <div className="flex justify-center items-center h-full">
                  <button className="text-4xl font-dm-sans tracking-tight mt-10 bg-colorFAF8F1 text-color282523 py-3 px-1/20 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform hover:scale-105">
                      <span>I&apos;m Ready!</span>
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7" />
                      </svg>
                  </button>
              </div>
          </div>
      </div>
  );
}
