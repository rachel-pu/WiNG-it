// // import Link from "next/link";
// // import Image from "next/image";
// // import Navigation from "/components/navigation";
// //
// // const BehavioralInterviewTranscripts = () => {
// //     return (
// //         <div className="flex h-screen w-full">
// //
// //             {/*/!* --------------------- vertical navbar --------------------- *!/*/}
// //             <Navigation/>
// //
// //             {/* --------------------- main background ---------------------*/}
// //             <div
// //                 className="relative flex-col h-full w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center ">
// //
// //                 {/* --------------------- first column --------------------- */}
// //                 <div className="grid grid-rows-2 max-w-6xl items-center justify-between w-full pt-1/50 pr-1/25 pl-1/25">
// //
// //
// //
// //                     {/* title */}
// //                     <h1 className="text-6xl font-dm-sans-black text-color282523 tracking-tighter">
// //                         Behavioral Interview Responses
// //                     </h1>
// //                     <p className="text-4xl font-dm-sans text-color282523 tracking-tighter">
// //                         Suggestions for Improvement:
// //                     </p>
// //
// //                 </div>
// //
// //                 {/* --------------------- grid of options --------------------- */}
// //                 <div className=" gap-10 px-10 w-full max-w-6xl">
// //
// //                     {/* behavioral interview  */}
// //                     <div
// //                         className="relative bg-gradient-to-b from-color6998C2 to-color3163C7 opacity-80 shadow bg-color5C9CF5 rounded-3xl p-6 pb-24 flex flex-col justify-between">
// //
// //                         {/* sample response */}
// //                         <div className='group flex justify-center items-center max-w-5xl'>
// //                             <Link href='saves/response'
// //                                   className="bg-gradient-to-t from-[#000000] to-[#FFFFFF] text-2xl font-dm-sans tracking-tight bg-colorFAF8F1 text-color282523 py-2 px-6 rounded-full font-semibold shadow-lg flex items-center space-x-2 ">
// //                                 <span className='font-satoshi text-left text-2.5xl'>October 31, 2024</span>
// //
// //                             </Link>
// //                         </div>
// //                         {/*<h2 className="mb-3 leading-10 text-4xl font-semibold text-colorF3F1EA font-dm-sans-black tracking-tighter">*/}
// //
// //
// //                         {/*</h2>*/}
// //                         {/*<p className="text-colorF3F1EA font-sat oshi leading-tight text-2.5xl">*/}
// //                         {/*    Your average score: </p>*/}
// //
// //                         {/*/!*-----------------button--------------------*!/*/}
// //                         {/*<div className="absolute bottom-6 right-6 group">*/}
// //                         {/*    <Link href='./behavioral-interview-saves'*/}
// //                         {/*          className="bg-gradient-to-r from-[#C8E2AF] to-[#6CBE20] text-2xl font-dm-sans tracking-tight text-color282523 py-2 px-8 rounded-full font-semibold shadow-lg flex items-center space-x-2 transition-transform duration-300 transform group-hover:scale-102 group-hover:-rotate-1">*/}
// //                         {/*        <span className="font-dm-sans-black">See Responses</span>*/}
// //                         {/*        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3"*/}
// //                         {/*             viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">*/}
// //                         {/*            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7"/>*/}
// //                         {/*        </svg>*/}
// //                         {/*    </Link>*/}
// //                         {/*</div>*/}
// //
// //
// //                     </div>
// //
// //                 </div>
// //             </div>
// //         </div>
// //     )
// //
// // }
// //
// // export default BehavioralInterviewTranscripts;
//
// import Link from "next/link";
// import Navigation from "/components/LeftNavbar.jsx";
//
// const BehavioralInterviewTranscripts = () => {
//     return (
//         <div className="flex h-screen w-full">
//             {/* Vertical Navigation */}
//             <Navigation />
//
//             {/* Main Background */}
//             <div
//                 className="relative flex flex-col h-full w-full bg-colorF3F1EA bg-[linear-gradient(to_right,#69ADFF50_1px,transparent_1px),linear-gradient(to_bottom,#69ADFF50_1px,transparent_1px)] bg-[size:24px_24px] flex justify-center items-center ">
//                 {/* Header Section */}
//                 <div className="mb-10">
//                     <h1 className="text-6xl font-dm-sans-black tracking-tight text-color282523 mb-2">
//                         Behavioral Interview Responses
//                     </h1>
//                     <p className="text-3xl font-dm-sans tracking-tight text-color282523 mb-4">
//                         Suggestions for Improvement:
//                     </p>
//                     <ul className="list-disc pl-8 text-2xl font-dm-sans tracking-tight text-color282523 space-y-2">
//                         <li>Use less filler words</li>
//                         <li>Use the STAR method</li>
//                         <li>Demonstrate how you are a leader</li>
//                         <li>Give examples of how you can adapt to unexpected situations</li>
//                     </ul>
//                 </div>
//
//                 {/* Response Cards Section */}
//                 <div className="font-dm-sans tracking-tight relative w-full max-w-6xl bg-gradient-to-b from-color3163C7 to-color6998C2 opacity-80 shadow bg-color5C9CF5 rounded-3xl shadow-lg p-6">
//                     {[
//                         { date: "October 3, 2024", stars: 5 },
//                         { date: "October 3, 2024", stars: 4 },
//                         { date: "October 2, 2024", stars: 3 },
//
//                     ].map((item, index) => (
//                         <div
//                             key={index}
//                             className="flex items-center justify-between bg-colorF3F1EA rounded-full p-4 mb-4 shadow-md"
//                         >
//                             {/* Date */}
//                             <span className="font-dm-sans text-color282523 text-2.5xl">{item.date}</span>
//
//                             {/* Star Ratings */}
//                             <div className="flex">
//                                 {Array.from({ length: 5 }).map((_, i) => (
//                                     <svg
//                                         key={i}
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         fill={i < item.stars ? "#FFD700" : "none"}
//                                         viewBox="0 0 24 24"
//                                         stroke="currentColor"
//                                         className="w-6 h-6 text-yellow-400"
//                                     >
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth={2}
//                                             d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
//                                         />
//                                     </svg>
//                                 ))}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default BehavioralInterviewTranscripts;
