"use client"; // Required for Next.js 13+ (app router)

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

export default function InterviewQuestions() {
  const [jobRole, setJobRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://wing-it-un4w.onrender.com/generate_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_role: jobRole }),
      });

      const data = await response.json();
      console.log("API Response:", data); // Debugging

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setIsOpen(true); // Show modal
      } else {
        console.error("No questions received:", data);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
    setLoading(false);
  };

  const handleQuestionClick = async (question) => {
    try {
      const response = await fetch("https://wing-it-un4w.onrender.com/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: question }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        console.error("Error converting text to speech");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white text-black shadow-lg rounded-xl mt-10">
      <input
        type="text"
        value={jobRole}
        onChange={(e) => setJobRole(e.target.value)}
        placeholder="Enter job role (e.g., Software Engineer)"
        className="w-full p-2 border border-gray-300 rounded mb-3 text-black"
      />
      <button
        onClick={fetchQuestions}
        className="w-full bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
      >
        {loading ? "Generating..." : "Generate Questions"}
      </button>

      {/* Dialog for displaying questions */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generated Questions</DialogTitle>
          </DialogHeader>
          <ul className="p-4 bg-gray-100 rounded text-black">
            {questions.map((q, index) => (
              <li key={index} className="border-b py-2" onClick={() => handleQuestionClick(q)}>
                {q}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}