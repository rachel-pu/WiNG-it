const {setGlobalOptions} = require("firebase-functions");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const OpenAI = require('openai')
require("dotenv").config();
const { createClient } = require("@deepgram/sdk");


// Initialize Firebase Admin
admin.initializeApp();
const db = admin.database();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const dgClient = createClient(process.env.DEEPGRAM_API_KEY);

// Rate limiting helper
const checkRateLimit = async (userId) => {
  const now = Date.now();
  const hourAgo = now - 3600000; // 1 hour ago
  
  const userRequests = await db.ref(`rate_limits/${userId}`)
    .orderByChild('timestamp')
    .startAt(hourAgo)
    .once('value');
  
  const requestCount = userRequests.numChildren();
  const maxRequests = 10; // requests per hour
  
  if (requestCount >= maxRequests) {
    return false;
  }
  
  // Add current request
  await db.ref(`rate_limits/${userId}`).push({
    timestamp: now
  });
  
  return true;

};
// Utility function to extract questions from text
function extractQuestions(text) {
  return text
    .split(/\d+\.\s/)
    .filter(Boolean)
    .map(q => q.trim());
}

exports.generateQuestions = functions.https.onRequest((req, res) => {
    console.log("Generating questions...");
  cors(req, res, async () => {
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { job_role, numQuestions, questionTypes } = req.body;

    const prompt = `
      Generate ${numQuestions} behavioral interview questions related to ${questionTypes} for a ${job_role || 'general'} role in tech.
      - Format strictly as: "1. [Question]", "2. [Question]", etc.
      - Do NOT include introductory text.
      - First question must introduce "Winnie" as interviewer.
    `;

    console.log(prompt);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      });

      const responseText = completion.choices[0].message.content;
      const questions = extractQuestions(responseText);

      if (!questions || questions.length === 0) {
        return res.status(500).json({ error: 'No valid questions generated' });
      }

      return res.json({
        questions,
        metadata: {
          provider: 'openai',
          tokens: completion.usage.total_tokens
        }
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
});

// Text to Speech using Google Cloud Speech
exports.textToSpeech = functions.https.onRequest((req, res) => {
  console.log("Converting text to speech");
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { text } = req.body;
      if (!text || text.trim() === "") {
        return res.status(400).json({ error: "No text provided" });
      }

      console.log(`Converting to speech: ${text.substring(0, 50)}...`);

      // Call Deepgram TTS (v3 syntax)
      const response = await dgClient.speak.request(
        { text },
        { model: "aura-asteria-en", encoding: "mp3" }
      );

      console.log("✅ Text-to-speech successful");

      // Convert the ReadableStream to a Buffer
      const stream = await response.getStream();
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);

      // Set headers for audio stream
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Cache-Control", "no-cache");

      // Send the audio buffer
      res.send(audioBuffer);
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      res.status(500).json({ error: "Text-to-speech failed", details: error.message });
    }
  });
});


exports.saveResponse = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { sessionId, questionNumber, questionText, recordedTime, audioData } = req.body;

      if (!sessionId || !questionNumber || !audioData) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Convert base64 audio to Buffer
      const audioBuffer = Buffer.from(audioData, "base64");

      // Transcribe with Deepgram v3
      let transcript = "";
      let fillerWords = [];

      try {
        const dgResponse = await dgClient.audio.transcription.create(
          {
            buffer: audioBuffer,
            mimetype: "audio/wav",
          },
          {
            model: "nova",
            language: "en-US",
            smart_format: true,
          }
        );

        transcript = dgResponse.results.channels[0].alternatives[0].transcript || "";
        const words = dgResponse.results.channels[0].alternatives[0].words || [];
        fillerWords = words
          .filter(w =>
            ["um", "uh", "hmm", "like", "you know", "actually", "basically", "literally", "so", "well"].includes(w.word.toLowerCase())
          )
          .map(w => w.word);

      } catch (dgError) {
        console.error("Deepgram transcription error:", dgError);
        return res.status(500).json({ error: "Failed to transcribe audio" });
      }

      // Prepare response data
      const responseData = {
        questionNumber,
        questionText,
        transcript,
        fillerWords,
        recordedTime: recordedTime || 0,
        timestamp: Date.now(),
        audioData: audioData
      };

      // Save to Firebase Realtime Database
      await db.ref(`interviews/${sessionId}/responses/${questionNumber}`).set(responseData);

      // Update session metadata
      const snapshot = await db.ref(`interviews/${sessionId}/responses`).once("value");
      const questionsCompleted = snapshot.numChildren();

      await db.ref(`interviews/${sessionId}/metadata`).update({
        lastUpdated: Date.now(),
        questionsCompleted
      });

      return res.json({
        success: true,
        sessionId,
        questionNumber,
        responseData,
        questionsCompleted
      });

    } catch (error) {
      console.error("Error saving response:", error);
      return res.status(500).json({ error: "Failed to save response" });
    }
  });
});

// Helper to count completed questions
async function getCompletedQuestionsCount(sessionId) {
  const snapshot = await db.ref(`interviews/${sessionId}/responses`).once("value");
  return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
}

// Get Interview Results
exports.getInterviewResults = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const sessionId = req.params[0] || req.query.sessionId;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
      }

      const snapshot = await db.ref(`interviews/${sessionId}`).once('value');
      const interviewData = snapshot.val();

      if (!interviewData) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      const responses = interviewData.responses || {};
      const questionsCompleted = Object.keys(responses).length;

      res.json({
        success: true,
        sessionId,
        responses,
        metadata: interviewData.metadata || {},
        complete: questionsCompleted >= 5,
        count: questionsCompleted
      });

    } catch (error) {
      console.error('Error fetching results:', error);
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  });
});

// Helper Functions
function extractQuestions(gptResponse) {
  const questions = [];
  const lines = gptResponse.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\d+\./.test(trimmed)) {
      const cleaned = trimmed.replace(/^\d+\.\s*/, '');
      if (cleaned) {
        questions.push(cleaned);
      }
    }
  }
  
  return questions;
}

async function getCompletedQuestionsCount(sessionId) {
  const snapshot = await db.ref(`interviews/${sessionId}/responses`).once('value');
  return snapshot.numChildren();
}

setGlobalOptions({ maxInstances: 10 });