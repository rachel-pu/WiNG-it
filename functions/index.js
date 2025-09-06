const {setGlobalOptions} = require("firebase-functions");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const OpenAI = require('openai')
require("dotenv").config();
const { createClient } = require("@deepgram/sdk");
const { Readable } = require("stream");


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


// saveReponse function
exports.saveResponse = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Method validation
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      // Extract and validate required fields
      const { sessionId, questionNumber, questionText, recordedTime, audioData, mimetype } = req.body;
      
      if (!sessionId || questionNumber === undefined || !audioData) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["sessionId", "questionNumber", "audioData"]
        });
      }

      // Validate and decode audioData
      // let audioBuffer;
      // try {
      //   audioBuffer = Buffer.from(audioData, "base64");
      // } catch (error) {
      //   return res.status(400).json({ error: "Invalid base64 audioData" });
      // }

      // Validate and decode audioData
let audioBuffer;
try {
  audioBuffer = Buffer.from(audioData, "base64");

  console.log("=== AUDIO BUFFER DEBUG ===");
  console.log("Buffer length (bytes):", audioBuffer.length);
  console.log("First 20 bytes:", audioBuffer.subarray(0, 20));
  console.log("Last 20 bytes:", audioBuffer.subarray(audioBuffer.length - 20));
} catch (error) {
  console.error("Base64 decoding failed:", error);
  return res.status(400).json({ error: "Invalid base64 audioData" });
}

      const audioStream = new Readable({
        read() {
        }
      });
      audioStream.push(audioBuffer);
      audioStream.push(null); // Signal end of stream
      console.log('Processing audio for transcription:');
      console.log('- Buffer size:', audioBuffer.length);
      console.log('- MIME type:', mimetype || 'not provided');
      console.log('- Session ID:', sessionId);
      console.log('- Question:', questionNumber);

      // Deepgram transcription
      let result;
      try {
        const response = await dgClient.listen.prerecorded.transcribeFile(
          audioStream,
          {
            model: "nova-2",
            language: "en-US",
            smart_format: true,
            filler_words: true,
            punctuate: true,
            diarize: false,
            mimetype: mimetype || "audio/webm"
          }
        );

        console.log("=== DEEPGRAM RAW RESPONSE ===");
        console.log(JSON.stringify(response, null, 2));
        result = response.result;
      } catch (transcriptionError) {
        console.error("Deepgram transcription error:", transcriptionError);
        return res.status(500).json({ 
          error: "Transcription failed", 
          details: transcriptionError.message 
        });
      }

      // Extract transcript and analysis data
      const transcript = result?.channels?.[0]?.alternatives?.[0]?.transcript || "";
      const words = result?.channels?.[0]?.alternatives?.[0]?.words || [];
      const confidence = result?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

      console.log('=== TRANSCRIPT EXTRACTION ===');
    console.log('- Transcript length:', transcript.length);
      console.log('- Transcript content:', transcript.substring(0, 100) + '...');
    console.log('- Words count:', words.length);
    console.log('- Confidence:', confidence);

    if (!transcript || transcript.trim() === "") {
      console.warn('⚠️ EMPTY TRANSCRIPT DETECTED');
    console.log('Raw result structure:', JSON.stringify(result, null, 2));
    }
      
      // Analyze filler words
      const fillerWordsList = [
        "um", "uh", "uhm", "hmm", "like", "you know", "actually", 
        "basically", "literally", "so", "well", "kind of", "sort of"
      ];
      
      const fillerWords = words
        .filter(w => w.word && fillerWordsList.includes(w.word.toLowerCase().trim()))
        .map(w => ({
          word: w.word,
          start: w.start,
          end: w.end,
          confidence: w.confidence
        }));

      // Calculate speech metrics
      const totalWords = words.length;
      const fillerWordCount = fillerWords.length;
      const fillerWordPercentage = totalWords > 0 ? (fillerWordCount / totalWords * 100).toFixed(2) : 0;
      
      // Calculate speaking pace (words per minute)
      const durationSeconds = recordedTime / 1000;
      const wordsPerMinute = durationSeconds > 0 ? Math.round((totalWords / durationSeconds) * 60) : 0;

      // Prepare response data (no audio storage)
      const responseData = {
        questionNumber: parseInt(questionNumber),
        questionText: questionText || "",
        transcript,
        analysis: {
          totalWords,
          fillerWords,
          fillerWordCount,
          fillerWordPercentage: parseFloat(fillerWordPercentage),
          transcriptionConfidence: confidence,
          wordsPerMinute,
          durationSeconds: Math.round(durationSeconds)
        },
        recordedTime: recordedTime || 0,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      };

      // Save to Firebase
      try {
        await db.ref(`interviews/${sessionId}/responses/${questionNumber}`).set(responseData);
        
        // Update session metadata
        const snapshot = await db.ref(`interviews/${sessionId}/responses`).once("value");
        const questionsCompleted = snapshot.numChildren();

        await db.ref(`interviews/${sessionId}/metadata`).update({
          lastUpdated: admin.database.ServerValue.TIMESTAMP,
          questionsCompleted,
        });

        console.log(`Successfully processed response for session ${sessionId}, question ${questionNumber}`);
        
        // Return useful data without the audio
        return res.status(200).json({ 
          success: true, 
          sessionId, 
          questionNumber: parseInt(questionNumber),
          transcript,
          analysis: responseData.analysis,
          questionsCompleted
        });

      } catch (dbError) {
        console.error("Database error:", dbError);
        return res.status(500).json({ 
          error: "Failed to save to database", 
          details: dbError.message 
        });
      }

    } catch (error) {
      console.error("Unexpected error in saveResponse:", error);
      return res.status(500).json({ 
        error: "Internal server error", 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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