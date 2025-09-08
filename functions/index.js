const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const OpenAI = require('openai');
require("dotenv").config();
const { createClient } = require('@deepgram/sdk');
const { Readable } = require("stream");

// Initialize Google Cloud Text-to-Speech
const textToSpeech = require('@google-cloud/text-to-speech');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.database();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);

// Initialize Google Cloud TTS client
const ttsClient = new textToSpeech.TextToSpeechClient();

// Utility function to extract questions from text
function extractQuestions(text) {
  return text
    .split(/\d+\.\s/)
    .filter(Boolean)
    .map(q => q.trim());
}

// Generate Questions Function
exports.generateQuestions = functions.https.onRequest((req, res) => {
  console.log("Generating questions...");
  return cors(req, res, async () => {
    try {
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
        - Do NOT include any introductory text, titles, or explanations.
        - Each question should only have one question mark max. There should be no multiple questions in one question. Make sure each question will not require the user to talk for over 5 minutes.
        - Combine this introduction into the first question you write. Introduce yourself before going into the question. Please introduce yourself as "Winnie" and say that you are the
           interviewer. Then afterwards, say "It's nice to meet you. Let's get started with the interview." before going into the first question.
           For instance, you should be saying "1. Hi, I'm Winnie. It's nice to meet you. Let's get started with the interview. [Question]".
      `;

      console.log(prompt);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      });

      // Calculate OpenAI cost (GPT-4o-mini: ~$0.0001/1K tokens)
      const inputTokens = completion.usage.prompt_tokens;
      const outputTokens = completion.usage.completion_tokens;
      const totalTokens = completion.usage.total_tokens;
      const estimatedCost = (totalTokens / 1000) * 0.0001;
      
      console.log(`🔢 OpenAI API Call Cost:`);
      console.log(`   Input tokens: ${inputTokens}`);
      console.log(`   Output tokens: ${outputTokens}`);
      console.log(`   Total tokens: ${totalTokens}`);
      console.log(`   Estimated cost: $${estimatedCost.toFixed(6)}`);

      const responseText = completion.choices[0].message.content;
      const questions = extractQuestions(responseText);

      if (!questions || questions.length === 0) {
        return res.status(500).json({ error: 'No valid questions generated' });
      }

      return res.json({
        questions,
        metadata: {
          provider: 'openai',
          tokens: completion.usage.total_tokens,
          estimatedCost: estimatedCost
        }
      });

    } catch (err) {
      console.error('Error in generateQuestions:', err);
      return res.status(500).json({ error: err.message });
    }
  });
});

// Text to Speech Function
exports.textToSpeech = functions.https.onRequest((req, res) => {
  console.log("Converting text to speech");
  return cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { text, voice = 'en-US-Wavenet-C' } = req.body;
      
      if (!text || text.trim() === "") {
        return res.status(400).json({ error: "No text provided" });
      }

      console.log(`Converting to speech: ${text.substring(0, 50)}...`);
      console.log(`Using voice: ${voice}`);

      // Validate text length
      if (text.length > 5000) {
        return res.status(400).json({ 
          error: "Text too long. Maximum 5000 characters allowed." 
        });
      }

      const request = {
        input: { text: text },
        voice: {
          languageCode: 'en-US',
          name: voice,
        },
        audioConfig: { 
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0,
        },
      };

      console.log("Sending request to Google Cloud TTS...");
      const [response] = await ttsClient.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error("No audio content received from Google Cloud TTS");
      }

      // Calculate Google TTS cost (~$4.00 per 1M characters for Wavenet voices)
      const characterCount = text.length;
      const estimatedCost = (characterCount / 1000000) * 4.00;
      
      console.log("✅ Text-to-speech successful");
      console.log(`Audio content size: ${response.audioContent.length} bytes`);
      console.log(`💰 Google TTS API Call Cost:`);
      console.log(`   Characters processed: ${characterCount}`);
      console.log(`   Estimated cost: $${estimatedCost.toFixed(6)}`);

      // Set headers for audio stream
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Content-Length", response.audioContent.length);

      // Send the audio buffer
      return res.send(response.audioContent);
      
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      
      // More detailed error handling
      if (error.code === 3) {
        return res.status(400).json({ 
          error: "Invalid request parameters", 
          details: error.message 
        });
      } else if (error.code === 7) {
        return res.status(403).json({ 
          error: "Permission denied. Check your Google Cloud credentials.", 
          details: error.message 
        });
      } else if (error.code === 8) {
        return res.status(429).json({ 
          error: "Quota exceeded", 
          details: error.message 
        });
      }
      
      return res.status(500).json({ 
        error: "Text-to-speech failed", 
        details: error.message,
        code: error.code || 'unknown'
      });
    }
  });
});

// Save Response Function
exports.saveResponse = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', '*');
        return res.status(204).send("");
      }

      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { sessionId, questionNumber, questionText, recordedTime, audioData, mimetype } = req.body;
      
      if (!sessionId || questionNumber === undefined || !audioData) {
        return res.status(400).json({ 
          error: "Missing required fields",
          required: ["sessionId", "questionNumber", "audioData"]
        });
      }

      let audioBuffer;
      try {
        audioBuffer = Buffer.from(audioData, "base64");
        console.log("Audio buffer length:", audioBuffer.length);
      } catch (error) {
        console.error("Base64 decoding failed:", error);
        return res.status(400).json({ error: "Invalid base64 audioData" });
      }

      const audioStream = new Readable({
        read() {}
      });
      audioStream.push(audioBuffer);
      audioStream.push(null);
      
      console.log('Processing audio for transcription...');

      // Deepgram Speech-to-Text transcription
      let result;
      try {
        const { result: transcriptionResult, error } = await deepgramClient.listen.prerecorded.transcribeFile(
          audioBuffer,
          {
            mimetype: 'audio/wav',
            model: 'nova-2',
            language: 'en-US',
            smart_format: true,
            punctuate: true,
            diarize: false,
            utterances: true,
            utt_split: 0.8,
            filler_words: true,
            numerals: true,
          }
        );
        
        if (error) {
          throw new Error(`Deepgram API error: ${error.message || error}`);
        }
        
        result = transcriptionResult;
        
        // Calculate Deepgram cost (~$0.0043 per minute for Nova-2 model)
        const durationMinutes = (recordedTime / 1000) / 60;
        const estimatedCost = durationMinutes * 0.0043;
        
        console.log(`🎙️ Deepgram API Call Cost:`);
        console.log(`   Audio duration: ${durationMinutes.toFixed(2)} minutes`);
        console.log(`   Model: Nova-2`);
        console.log(`   Estimated cost: $${estimatedCost.toFixed(6)}`);
      } catch (transcriptionError) {
        console.error("Deepgram transcription error:", transcriptionError);
        return res.status(500).json({ 
          error: "Transcription failed", 
          details: transcriptionError.message 
        });
      }

      // Extract transcript and analysis data
      const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
      const words = result?.results?.channels?.[0]?.alternatives?.[0]?.words || [];
      const confidence = result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

      console.log('Transcript:', transcript.substring(0, 100));
      
      // Analyze filler words
      const fillerWordsList = [
      "um", "uh", "uhm", "hmm", "like", "you know", "actually", "i think", "guess",
      "basically", "literally", "so", "well", "kind of", "sort of", "maybe",
      "er", "ah", "huh", "right", "okay", "alright", "just", "anyway", "I mean",
      "sorta", "kinda", "like I said", "you see", "as I said", "or something", 
      "if that makes sense", "you know what I mean", "let’s see", "so yeah", "so basically"
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
      
      const durationSeconds = recordedTime / 1000;
      const wordsPerMinute = durationSeconds > 0 ? Math.round((totalWords / durationSeconds) * 60) : 0;

      // Prepare response data
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
      await db.ref(`interviews/${sessionId}/responses/${questionNumber}`).set(responseData);
      
      // Update session metadata
      const snapshot = await db.ref(`interviews/${sessionId}/responses`).once("value");
      const questionsCompleted = snapshot.numChildren();

      await db.ref(`interviews/${sessionId}/metadata`).update({
        lastUpdated: admin.database.ServerValue.TIMESTAMP,
        questionsCompleted,
      });

      console.log(`Successfully processed response for session ${sessionId}, question ${questionNumber}`);
      
      return res.status(200).json({ 
        success: true, 
        sessionId, 
        questionNumber: parseInt(questionNumber),
        transcript,
        analysis: responseData.analysis,
        questionsCompleted
      });

    } catch (error) {
      console.error("Unexpected error in saveResponse:", error);
      return res.status(500).json({ 
        error: "Internal server error", 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
});

// Get Interview Results Function
exports.getInterviewResults = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      const { sessionId } = req.body.data || {};
      
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

      return res.json({
        data: {
          success: true,
          sessionId,
          responses,
          metadata: interviewData.metadata || {},
          complete: questionsCompleted >= 5,
          count: questionsCompleted
        }
      });

    } catch (error) {
      console.error('Error fetching results:', error);
      return res.status(500).json({ 
        data: {
          success: false,
          error: 'Failed to fetch results',
          details: error.message
        }
      });
    }
  });
});
