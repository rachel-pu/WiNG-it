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
  
  return cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }
      
      const { job_role, numQuestions, questionTypes, interviewerDifficulty } = req.body;

      // Define interviewer personality based on difficulty
      const getInterviewerPersonality = (difficulty) => {
        switch (difficulty) {
          case 'easy-going-personality':
            return {
              tone: 'friendly, warm, and encouraging',
              style: 'Use a conversational and supportive tone. Be patient and understanding.',
              questions: 'Ask straightforward questions that build confidence.'
            };
          case 'professional-personality':
            return {
              tone: 'professional, polite, and businesslike',
              style: 'Maintain a formal but approachable demeanor. Be thorough but fair.',
              questions: 'Ask standard behavioral questions with appropriate follow-ups.'
            };
          case 'intense-personality':
            return {
              tone: 'direct, challenging, and probing',
              style: 'Be more demanding and ask for specific details. Push for concrete examples.',
              questions: 'Ask complex, multi-layered questions that require detailed responses.'
            };
          case 'randomize-personality':
            return {
              tone: 'varied - mix friendly, professional, and challenging approaches',
              style: 'Vary your approach throughout the interview. Keep the candidate on their toes.',
              questions: 'Use a mix of question styles from easy to challenging.'
            };
          default:
            return {
              tone: 'professional and balanced',
              style: 'Maintain a standard interview approach.',
              questions: 'Ask standard behavioral interview questions.'
            };
        }
      };

      const personality = getInterviewerPersonality(interviewerDifficulty);

      console.log("Generating ", numQuestions, " questions...");
      const prompt = `
        Generate exactly ${numQuestions} behavioral interview questions related to ${questionTypes} for a ${job_role || 'general'} role in tech.
        Generate only the number of questions requested. Do not generate more than ${numQuestions} questions.
        
        INTERVIEW DIFFICULTY LEVEL: ${interviewerDifficulty} (${personality.tone})
        INTERVIEWER PERSONALITY: You are Winnie, an interviewer with a ${personality.tone} personality.
        STYLE GUIDELINES: ${personality.style}
        QUESTION APPROACH: ${personality.questions}

        DIFFICULTY-SPECIFIC REQUIREMENTS FOR ${interviewerDifficulty.toUpperCase()}:
        ${interviewerDifficulty === 'easy-going-personality' ? `
        - Ask warm, straightforward questions that build confidence
        - Use encouraging language and be supportive
        - Focus on basic STAR method scenarios
        - Avoid overly complex or multi-part questions` :
        interviewerDifficulty === 'professional-personality' ? `
        - Ask standard behavioral questions with clear expectations
        - Maintain professional tone throughout
        - Include questions about teamwork, leadership, and problem-solving
        - Balance challenge with fairness` :
        interviewerDifficulty === 'intense-personality' ? `
        - Ask challenging, probing questions that require detailed responses
        - Request specific metrics, outcomes, and concrete examples
        - Include follow-up scenarios and hypothetical situations
        - Push for deeper analysis and critical thinking` :
        interviewerDifficulty === 'randomize-personality' ? `
        - Mix question styles from easy to challenging randomly
        - Vary your tone and approach for each question
        - Include both supportive and demanding questions
        - Keep the candidate adapting to different interviewer styles` : `
        - Use standard interview approach`}

        FORMATTING REQUIREMENTS:

        - Make sure to come up with different, unique, and creative questions every time this prompt is run.
        - Format strictly as: "1. [Question]", "2. [Question]", etc.
        - Do NOT include any introductory text, titles, or explanations.
        - Each question should only have one question mark max. There should be no multiple questions in one question.
        - Make sure each question will not require the user to talk for over 5 minutes.
        - Combine this introduction into the first question you write. Introduce yourself before going into the question.
          Please introduce yourself as "Winnie" and say that you are the interviewer. Then afterwards, say "It's nice to meet you. Let's get started with the interview." before going into the first question.
          For instance, you should be saying "1. Hi, I'm Winnie. It's nice to meet you. Let's get started with the interview. [Question]".

        PERSONALITY-SPECIFIC INSTRUCTIONS:
        - Fully embody the ${interviewerDifficulty.replace('-personality', '')} difficulty level in your question selection and phrasing.
        - Questions should reflect the interviewer's personality while remaining professional and appropriate.
        - Ensure each question matches the specified difficulty level and interviewer style consistently.
      `;

      console.log(prompt);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 1.0
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
      console.log("Questions: ", questions);

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
      console.log("Recorded Time: ", recordedTime);
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
      console.log('Transcript:', transcript.substring(0, 100));
      const prompt = `
          Generate a JSON object with the keys: fillerWords, questionTypes, improvements, fillerWordsList, strengths, tips, and contentScore.
          Using the following:

          Transcript: ${transcript}
          Question: ${questionText}

          Instructions:
          - Count how many filler words (um, uh, like, so, anyway, kinda, etc.) exist in the transcript, add the count to fillerWords and add the filler words as strings to the array fillerWordsList.
          - Categorize the question as any of: Situational, Problem-solving, Technical, Leadership, Teamwork (can be multiple).
          - Provide 1-2 bullet points of tips to improve the answer (provide as an array).
          - Provide 1-2 bullet points of strengths to improve the answer (provide as an array).
          - Provide 1-2 bullet points of improvements to improve the answer (provide as an array).
          - Give a contentScore (0 to 60) based on how strong the answer is for an interview and how relevant the answer is to the question where 0 is a low score and 60 is the best possible score.

          Respond ONLY with valid JSON. Do NOT include any explanation or text outside the JSON.
      `;

      // After parsing AI response
      let aiResults;
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
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
          fillerWords: [], 
          contentScore: 0, 
          questionTypes: [], 
          tips: "" 
        };
      }

      // Extract individual fields
      const fillerWordCount = aiResults.fillerWords;
      const contentScore = aiResults.contentScore;
      const questionTypes = aiResults.questionTypes;
      const tips = aiResults.tips;
      const strengths = aiResults.strengths;
      const improvements = aiResults.improvements;
      const fillerWordsList = aiResults.fillerWordsList;

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
          fillerWordCount,
          wordsPerMinute,
          fillerWordsList,
          contentScore,
          questionTypes,
          strengths,
          improvements,
          tips
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

      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (err) {
          return res.status(400).json({ error: "Invalid JSON" });
        }
      }

      const { sessionId } = body || {};


      
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
      }
      console.log("SessionID", sessionId);
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