const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const OpenAI = require('openai');
require('dotenv').config();
const { createClient } = require('@deepgram/sdk');
const { Readable } = require('stream');
const textToSpeech = require('@google-cloud/text-to-speech');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.database();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});
const deepgramClient = createClient(process.env.VITE_DEEPGRAM_API_KEY);

// Initialize Google Cloud TTS client
const ttsClient = new textToSpeech.TextToSpeechClient();

// Utility function to extract questions from text
function extractQuestions(text, maxQuestions = 10) {
  const questions = text
    .split(/\d+\.\s/)
    .filter(Boolean)
    .map(q => q.trim())
    .filter(q => q.length > 10) // Filter out very short entries
    .slice(0, maxQuestions); // Limit to requested number
    
  console.log(`Extracted ${questions.length} questions (max: ${maxQuestions})`);
  return questions;
}

// Generate Questions Function
const generateQuestions = functions.https.onRequest((req, res) => {
  console.log("Generating questions...");
  return cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { job_role, company, numQuestions, questionTypes, interviewerDifficulty, customQuestions } = req.body;

      // If custom questions are provided, return them directly
      if (customQuestions && Array.isArray(customQuestions) && customQuestions.length > 0) {
        console.log(`Using custom questions: ${customQuestions.length} questions provided`);
        return res.json({
          questions: customQuestions,
          metadata: {
            provider: 'custom',
            requested: customQuestions.length,
            generated: customQuestions.length,
            returned: customQuestions.length
          }
        });
      }

      // Otherwise, generate AI questions
      const companyContext = company ? ` at ${company}` : '';
      const prompt = `
        Generate EXACTLY ${numQuestions} behavioral interview questions related to ${questionTypes} for a ${job_role || 'general'} job position${companyContext}.

        IMPORTANT: Generate ONLY ${numQuestions} questions. No more, no less.

        Rules:
        - Format strictly as: "1. [Question]", "2. [Question]", etc.
        - Do NOT include any introductory text, titles, or explanations outside the numbered format.
        - Each question should only have one question mark max. There should be no multiple questions in one question. Make sure each question will not require the user to talk for over 5 minutes.
        - For the questions, factor in the interviewerDifficulty level: ${interviewerDifficulty || 'medium'}.
        - For example, if interviewerDifficulty is "Intense", include more challenging questions that require deep reflection and problem-solving and be more harsh in the question.
        - If interviewerDifficulty is "Professional", include a balanced mix of common and moderately challenging questions and deliver them in a standard corporate interview style
        - If interviewerDifficulty is "Easy-going", include more straightforward and common questions that are easier to answer and deliver them in a friendly and relaxed manner.
        - Ensure questions are clear, concise, and relevant to the specified job role and question types.
        - Avoid overly complex or ambiguous questions.
      `;

      console.log(prompt);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 1
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
      console.log(`Raw OpenAI response: ${responseText.substring(0, 200)}...`);

      const questions = extractQuestions(responseText, numQuestions);

      if (!questions || questions.length === 0) {
        return res.status(500).json({ error: 'No valid questions generated' });
      }

      // Ensure we have the exact number requested
      const finalQuestions = questions.slice(0, numQuestions);

      console.log(`Requested: ${numQuestions} questions, Generated: ${questions.length}, Returning: ${finalQuestions.length}`);

      if (finalQuestions.length !== numQuestions) {
        console.warn(`Warning: Requested ${numQuestions} questions but got ${finalQuestions.length}`);
      }

      return res.json({
        questions: finalQuestions,
        metadata: {
          provider: 'openai',
          tokens: completion.usage.total_tokens,
          estimatedCost: estimatedCost,
          requested: numQuestions,
          generated: questions.length,
          returned: finalQuestions.length
        }
      });

    } catch (err) {
      console.error('Error in generateQuestions:', err);
      return res.status(500).json({ error: err.message });
    }
  });
});

// Text to Speech Function
const handleTextToSpeech = functions.https.onRequest((req, res) => {
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
const saveResponse = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { userId, sessionId, questionNumber, questionText, recordedTime, audioData, mimetype } = req.body;
      
      if (!userId || !sessionId || questionNumber === undefined || !audioData) {
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
      console.log('Transcript:', transcript.substring(0, 100));

      const prompt = `
          Generate a JSON object with the keys: technology, questionTypes, strengths, tips, starAnswerParsed, starAnswerParsedImproved, improvedResponse.
          Using the following:

          Transcript: ${transcript}
          Question: ${questionText}

          Instructions:
          - Identify any technology, programming languages, and tools mentioned in the transcript, add them as an array to technology.
          - Categorize the question as any of: Situational, Problem-solving, Technical, Leadership, Teamwork (can be multiple).
          - Provide 1-2 bullet points of specific tips to improve the answer (provide as an array).
          - Provide 1-2 bullet points of strengths to improve the answer (provide as an array).
          - For the improvedResponse variable, according to everything analyzed, rewrite the response to be a better answer to the question provided. Respond ONLY with valid JSON. Do NOT include any explanation or text outside the JSON.
          - For the starAnswerParsed variable, this should be a hashmap that extracts out each part of the answer in the transcript according to the star interview method.

          starAnswerParsed Important rules:
          - DO NOT summarize, rephrase, or clean the text.
          - DO NOT add periods at the end of values.
          - DO NOT make up any information.
          - Keep filler words, stutters, and unfinished phrases exactly as in the transcript.
          - Output ONLY valid JSON with exactly 4 keys: situation, task, action, result.

          Example Input Transcript:
          "Yeah so um I had this project at school where I needed to do a database project and uh I didn't know SQL at first so I had to learn it quickly and uh yeah I figured it out"

          Example Output JSON:
          {
            "situation": "Yeah so um I had this project at school where I needed to do a database project",
            "task": "",
            "action": "uh I didn't know SQL at first so I had to learn it quickly",
            "result": "uh yeah I figured it out"
          }
            Now analyze the transcript from above (not the example transcript) and fill in the starAnswerParsed variable.

          - Finally, using the improvedResponse, extract the response into the STAR interview method components and fill in the starAnswerParsedImproved variable
          This should be formatted the same as the starAnswerParsed variable and follow the same starAnswerParsed Important rules.
          For example:

          Example Output JSON:
          {
            "situation": "I was assigned a school project that required building a database, but I initially had no experience with SQL",
            "task": "I was assigned a school project that required building a database",
            "action": "I quickly learned SQL through tutorials and practice",
            "result": "successfully completing the project and gaining confidence in database management"
          }
      `;

      // After parsing AI response
      let aiResults;
      try {
        // Dynamic token allocation based on transcript length
        // Base: 500 tokens, +1 token per 4 chars, max 2000 tokens
        const dynamicTokens = Math.min(500 + Math.floor(transcript.length / 4), 2000);
        console.log(`Dynamic token allocation: ${dynamicTokens} tokens for transcript length: ${transcript.length}`);

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: dynamicTokens,
          temperature: 0
        });

        const responseText = completion.choices[0].message.content;

        // Extract JSON safely
        const match = responseText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON found in AI response");

        aiResults = JSON.parse(match[0]); // <- store parsed JSON here
      } catch (err) {
        console.error("Error analyzing AI response:", err);
        aiResults = {
          questionTypes: [],
          tips: "" ,
          strengths: "",
        };
      }

      // Extract individual fields
      const questionTypes = aiResults.questionTypes;
      const tips = aiResults.tips;
      const technology = aiResults.technology;
      const strengths = aiResults.strengths;
      const starAnswerParsedImproved = aiResults.starAnswerParsedImproved;
      const starAnswerParsed = aiResults.starAnswerParsed;
      const improvedResponse = aiResults.improvedResponse;

      // Calculate speech metrics
      const totalWords = words.length;
      const durationSeconds = recordedTime / 1000;
      const wordsPerMinute = durationSeconds > 0 ? Math.round((totalWords / durationSeconds) * 60) : 0;

      // Prepare response data
      const responseData = {
        questionNumber: parseInt(questionNumber),
        questionText: questionText || "",
        transcript,
        analysis: {
          totalWords,
          wordsPerMinute,
          technology,
          questionTypes,
          strengths,
          tips,
          starAnswerParsed,
          starAnswerParsedImproved,
          improvedResponse
        },
        recordedTime: recordedTime || 0,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      };

      // Save to Firebase
      await db.ref(`interviews/${userId}/${sessionId}/responses/${questionNumber}`).set(responseData);
      
      // Update session metadata
      const snapshot = await db.ref(`interviews/${userId}/${sessionId}/responses`).once("value");
      const questionsCompleted = snapshot.numChildren();

      await db.ref(`interviews/${userId}/${sessionId}/metadata`).update({
        lastUpdated: admin.database.ServerValue.TIMESTAMP,
        questionsCompleted,
      });

      console.log(`Successfully processed response for user ${userId} and session ${sessionId}, question ${questionNumber}`);
      
      return res.status(200).json({ 
        success: true, 
        userId,
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
        details: error.message
      });
    }
  });
});



// Get Interview Results Function
const getInterviewResults = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {

    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      const { userId, sessionId } = req.body || {};
      
      if (!userId || !sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
      }

      const snapshot = await db.ref(`interviews/${userId}/${sessionId}`).once('value');
      const interviewData = snapshot.val();

      if (!interviewData) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      const responses = interviewData.responses || {};
      const questionsCompleted = Object.keys(responses).length;

      return res.json({
        data: {
          success: true,
          userId,
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

module.exports = { generateQuestions, handleTextToSpeech, saveResponse, getInterviewResults };