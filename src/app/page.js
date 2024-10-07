import Image from "next/image";

export default function Home() {
  return (
      // background grid
      <div
          className="relative h-screen w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center">
          {/* Main content box */}
          <div className="bg-gradient-to-r from-color8BCA67/60 via-colorBDE3E3/60 to-color5C9CF5/60 w-11/12 h-11/12 p-20 rounded-lg shadow-lg relative">
              {/* Sticky note section */}
              <div className="absolute top-2 right-2 bg-yellow-300 p-2 rounded shadow-lg">
                  <p className="text-sm font-bold text-black">why WING.it?<br/>who are we?</p>
              </div>

              <div className="">
                  <h2 className="text-4xl">
                      Are you ready to
                  </h2>
                  {/* Title  */}
                  <h1 className="text-9xl font-bold mb-4">
                      WiNG.it
                  </h1>
                  <p className="text-xl mb-6">
                      so you don&apos;t need to wing it?
                  </p>
                  <p className="text-md mb-8">
                      It&apos;s time to be Well-prepared for Interviews, Networking, and being Great!
                  </p>
              </div>
              {/* Button */}
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold">
                  I&apos;m Ready!
              </button>
          </div>
      </div>
  );
}
