import InterviewQuestions from "../../../../components/InterviewQuestions";
import SpeechToText from "../../../../components/SpeechToText";

export default function Behavioral() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-white">
      <SpeechToText />
    </main>
  );
}

//
// 'use client';
//
// import { useState } from 'react';
// import InterviewQuestions from "../../../../components/InterviewQuestions";
// import TranscribeAnswers from "../../../../components/TranscribeAnswers";
//
// export default function Behavioral() {
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [transcripts, setTranscripts] = useState({});
//   const [interviewStarted, setInterviewStarted] = useState(false);
//
//   const handleQuestionsGenerated = (generatedQuestions) => {
//     setQuestions(generatedQuestions);
//     setInterviewStarted(true);
//   };
//
//   const handleTranscript = (transcript) => {
//     setTranscripts(prev => ({
//       ...prev,
//       [questions[currentQuestionIndex]]: transcript
//     }));
//   };
//
//   const handleNextQuestion = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };
//
//   const handlePreviousQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };
//
//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
//       {!interviewStarted ? (
//         <div className="w-full max-w-2xl">
//           <InterviewQuestions onQuestionsGenerated={handleQuestionsGenerated} />
//         </div>
//       ) : (
//         <div className="w-full max-w-2xl space-y-8">
//           <div className="flex justify-between items-center">
//             <button
//               onClick={handlePreviousQuestion}
//               disabled={currentQuestionIndex === 0}
//               className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span className="font-medium">
//               Question {currentQuestionIndex + 1} of {questions.length}
//             </span>
//             <button
//               onClick={handleNextQuestion}
//               disabled={currentQuestionIndex === questions.length - 1}
//               className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//
//           <div className="bg-gray-50 p-6 rounded-lg shadow">
//             <h2 className="text-xl font-semibold mb-4">
//               {questions[currentQuestionIndex]}
//             </h2>
//             <TranscribeAnswers
//               currentQuestion={questions[currentQuestionIndex]}
//               onTranscript={handleTranscript}
//             />
//           </div>
//
//           {Object.keys(transcripts).length > 0 && (
//             <div className="mt-8">
//               <h3 className="text-lg font-medium mb-4">Your Responses</h3>
//               <div className="space-y-4">
//                 {Object.entries(transcripts).map(([question, answer], index) => (
//                   <div key={index} className="border p-4 rounded-lg">
//                     <p className="font-medium">{question}</p>
//                     <p className="mt-2 text-gray-700">{answer}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </main>
//   );
// }