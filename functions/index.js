const {setGlobalOptions} = require("firebase-functions");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const OpenAI = require('openai')
require("dotenv").config();

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.database();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'No text provided' });
      }

      // For now, return a placeholder response
      // You'll need to implement Google Cloud Text-to-Speech here
      res.json({ 
        success: true, 
        message: 'Text-to-speech would be implemented here',
        audioUrl: null
      });

    } catch (error) {
      console.error('Error in text-to-speech:', error);
      res.status(500).json({ error: 'Text-to-speech failed' });
    }
  });
});

// Save Interview Response
exports.saveResponse = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const {
        sessionId,
        questionNumber,
        questionText,
        transcript,
        fillerWords = [],
        audioData
      } = req.body;

      if (!sessionId || !questionNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const responseData = {
        questionNumber,
        questionText,
        transcript,
        fillerWords,
        timestamp: Date.now(),
        audioData: audioData || null
      };

      // Save to Firebase Realtime Database
      await db.ref(`interviews/${sessionId}/responses/${questionNumber}`)
        .set(responseData);

      // Update session metadata
      await db.ref(`interviews/${sessionId}/metadata`).update({
        lastUpdated: Date.now(),
        questionsCompleted: await getCompletedQuestionsCount(sessionId)
      });

      res.json({
        success: true,
        sessionId,
        questionNumber,
        responseData
      });

    } catch (error) {
      console.error('Error saving response:', error);
      res.status(500).json({ error: 'Failed to save response' });
    }
  });
});

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