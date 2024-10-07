import Image from "next/image";

export default function Home() {
  return (
      // background grid
      <div className="relative h-screen w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center">
          {/* main content box */}
          <div
              className="mx-auto bg-gradient-to-r from-color8BCA67/40 via-colorBDE3E3/40 to-color5C9CF5/40 w-12.75/15 h-11/12 p-20 rounded-lg shadow-lg relative">

              {/* sticky note section */}
              <div className="absolute top-2 right-2 bg-yellow-300 p-2 rounded shadow-lg">
                  <p className="text-sm font-bold text-color282523">why WING.it?<br/>who are we?</p>
              </div>

              {/* ----------------- title text ----------------- */}
              <div className="text-color282523 pl-1/6.5 mb-1/20">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl -mb-1/15 mt-1/25 font-dm-sans-semibold tracking-tighter">
                      Are you ready to
                  </h2>
                  {/* title */}
                  <h1 className="text-4xl sm:text-5xl md:text-10xl lg:text-10xl xl:text-12xl -mb-1/15 font-dm-sans-black tracking-tighter">
                      WiNG.it
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-1/15 font-dm-sans-semibold tracking-tighter">
                      so you don&apos;t need to wing it?
                  </p>
              </div>

              {/* subtext */}
              <p className="text-2xl tracking-tight mb-8 text-center text-color282523 font-satoshi">
                  It&apos;s time to be Well-prepared for Interviews, Networking, and being Great!
              </p>
              {/* ----------------- button ----------------- */}
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold">
                  I&apos;m Ready!
              </button>
          </div>
      </div>
  );
}
