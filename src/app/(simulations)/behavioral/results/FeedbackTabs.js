/**
 * Utility function to retrieve and format transcript content for interview questions
 * @param {string|null} questionNumber - Optional specific question number to retrieve
 * @param {string} sessionId - The interview session ID
 * @returns {Promise<{html: string, data: Object}>} - HTML formatted transcript content and raw data
 */
export const getTranscriptContentForQuestion = async (questionNumber, sessionId) => {
  try {
    if (!sessionId) {
      console.error("No session ID provided to getTranscriptContentForQuestion");
      return {
        html: "<p class='text-red-500'>No session ID provided to getTranscriptContentForQuestion</p>",
        data: null
      };
    }

    console.log(`Fetching transcript for session ${sessionId}${questionNumber ? `, question ${questionNumber}` : ''}`);

    // Fetch responses from backend using sessionId
    const response = await fetch(`https://wing-it-un4w.onrender.com/get-all-responses/${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch interview results: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Unknown error from server");
    }

    const storedResponses = data.responses || {};
    console.log(`Received ${Object.keys(storedResponses).length} responses:`, Object.keys(storedResponses));

    // Filter for the specific question if questionNumber is provided
    if (questionNumber) {
      // Since the new API format uses question numbers as keys directly
      if (!storedResponses[questionNumber]) {
        return {
          html: `<div class="text-left p-4 bg-yellow-50 border-l-4 border-yellow-500">
            <p class="text-yellow-700">No transcript available for Question ${questionNumber}.</p>
          </div>`,
          data: null
        };
      }

      const response = storedResponses[questionNumber];
      let content = `<div class="text-left">
        <p class="text-xl font-bold mb-4">Question ${questionNumber}: ${response.question_text}</p>
        <p class="mt-4 mb-3"><strong>Your response:</strong></p>
        <div class="bg-white p-4 rounded-lg shadow-sm mb-4">${response.transcript || "No response recorded"}</div>`;

      if (response.filler_words && response.filler_words.length > 0) {
        content += `<p class="mt-4"><strong>Filler words used (${response.filler_words.length}):</strong></p>
        <div class="flex flex-wrap gap-2 mt-2">
          ${response.filler_words.map(word => 
            `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${word}</span>`
          ).join("")}
        </div>`;
      } else {
        content += `<p class="mt-4 text-green-700"><strong>✓ No filler words detected</strong></p>`;
      }

      content += `</div>`;
      return { html: content, data: { [questionNumber]: response } };
    }

    // Return all transcripts if no question number is specified
    if (Object.keys(storedResponses).length === 0) {
      return {
        html: `<div class="text-center p-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No transcripts</h3>
          <p class="mt-1 text-sm text-gray-500">No transcript data available. Object.keys(storedResponses).length = 0</p>
        </div>`,
        data: null
      };
    }

    // Format all transcripts
    let formattedTranscript = "<div class='text-left'>";
    formattedTranscript += "<h3 class='text-2xl font-bold mb-6'>All Responses</h3>";

    // Sort questions by number
    const sortedKeys = Object.keys(storedResponses).sort((a, b) => {
      return parseInt(a) - parseInt(b);
    });

    sortedKeys.forEach(questionNumber => {
      const response = storedResponses[questionNumber];
      formattedTranscript += `<div class="mb-8 pb-6 border-b border-gray-200">`;
      formattedTranscript += `<p class="text-xl font-bold mb-3">Question ${questionNumber}: ${response.question_text}</p>`;
      formattedTranscript += `<p class="mb-2"><strong>Your response:</strong></p>`;
      formattedTranscript += `<div class="bg-white p-4 rounded-lg shadow-sm mb-4">${response.transcript || "No response recorded"}</div>`;

      if (response.filler_words && response.filler_words.length > 0) {
        formattedTranscript += `<p><strong>Filler words used (${response.filler_words.length}):</strong></p>
        <div class="flex flex-wrap gap-2 mt-2">
          ${response.filler_words.map(word => 
            `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${word}</span>`
          ).join("")}
        </div>`;
      } else {
        formattedTranscript += `<p class="text-green-700"><strong>✓ No filler words detected</strong></p>`;
      }

      formattedTranscript += `</div>`;
    });

    formattedTranscript += "</div>";
    return { html: formattedTranscript, data: storedResponses };
  } catch (error) {
    console.error("Error fetching transcripts:", error);
    return {
      html: `<div class="p-4 bg-red-50 border-l-4 border-red-500">
        <p class="text-red-700">Error loading transcripts: ${error.message}</p>
        <p class="text-sm mt-2">Please try refreshing the page or check your connection to the server.</p>
      </div>`,
      data: null
    };
  }
};
