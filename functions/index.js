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
        Generate EXACTLY ${numQuestions} behavioral interview questions related to ${questionTypes} for a ${job_role || 'general'} role in tech.
        
        IMPORTANT: Generate ONLY ${numQuestions} questions. No more, no less.
        
        Rules:
        - Format strictly as: "1. [Question]", "2. [Question]", etc.
        - Do NOT include any introductory text, titles, or explanations outside the numbered format.
        - Each question should only have one question mark max. There should be no multiple questions in one question. Make sure each question will not require the user to talk for over 5 minutes.
        - For the FIRST question only: Combine this introduction: "Hi, I'm Winnie. It's nice to meet you. Let's get started with the interview." before the actual question.
        - For example: "1. Hi, I'm Winnie. It's nice to meet you. Let's get started with the interview. [First Question]"
        - Questions 2-${numQuestions} should be direct questions without any introduction.
        
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

// Generate Personalized Feedback Function
exports.generatePersonalizedFeedback = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { sessionId, questionNumber, transcript, analysis, questionText } = req.body;
      
      if (!transcript || !analysis || !questionText) {
        return res.status(400).json({ error: 'Missing required fields: transcript, analysis, questionText' });
      }

      const prompt = `
        Analyze this behavioral interview response and provide personalized feedback:
        
        Question: "${questionText}"
        Response: "${transcript}"
        
        Analysis Data:
        - Word Count: ${analysis.totalWords}
        - Duration: ${analysis.durationSeconds} seconds
        - Filler Words: ${analysis.fillerWordCount} (${analysis.fillerWordPercentage}%)
        - Speaking Confidence: ${(analysis.transcriptionConfidence * 100).toFixed(1)}%
        - Words per minute: ${analysis.wordsPerMinute}
        
        Please provide:
        1. 2-3 specific strengths (what they did well)
        2. 2-3 areas for improvement (specific actionable advice)
        3. 2-3 practical tips for interview preparation
        
        Format as JSON:
        {
          "strengths": ["strength 1", "strength 2", "strength 3"],
          "improvements": ["improvement 1", "improvement 2", "improvement 3"],
          "tips": ["tip 1", "tip 2", "tip 3"]
        }
        
        Make the feedback specific to their actual response content, not generic advice. Focus on storytelling structure, specific details, impact metrics, and communication style.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ 
          role: "user", 
          content: prompt 
        }],
        max_tokens: 800,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      // Calculate cost
      const totalTokens = completion.usage.total_tokens;
      const estimatedCost = (totalTokens / 1000) * 0.0001;
      
      console.log(`🎯 Personalized Feedback API Call:`);
      console.log(`   Total tokens: ${totalTokens}`);
      console.log(`   Estimated cost: $${estimatedCost.toFixed(6)}`);

      const feedbackData = JSON.parse(completion.choices[0].message.content);

      // Save feedback to database if sessionId provided
      if (sessionId && questionNumber) {
        await db.ref(`interviews/${sessionId}/responses/${questionNumber}/personalizedFeedback`).set({
          ...feedbackData,
          generatedAt: admin.database.ServerValue.TIMESTAMP,
          model: "gpt-4o-mini",
          cost: estimatedCost
        });
      }

      return res.json({
        success: true,
        feedback: feedbackData,
        metadata: {
          tokens: totalTokens,
          cost: estimatedCost,
          model: "gpt-4o-mini"
        }
      });

    } catch (error) {
      console.error('Error generating personalized feedback:', error);
      return res.status(500).json({ 
        error: 'Failed to generate feedback',
        details: error.message
      });
    }
  });
});

// Generate Overall Interview Feedback Function
exports.generateOverallFeedback = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { sessionId, responses, overallScore } = req.body;
      
      if (!responses || Object.keys(responses).length === 0) {
        return res.status(400).json({ error: 'Missing responses data' });
      }

      // Aggregate data from all responses
      let totalWords = 0;
      let totalDuration = 0;
      let totalFillerWords = 0;
      let allTranscripts = [];
      let allQuestions = [];

      Object.values(responses).forEach(response => {
        if (response && response.analysis) {
          totalWords += response.analysis.totalWords || 0;
          totalDuration += response.analysis.durationSeconds || 0;
          totalFillerWords += response.analysis.fillerWordCount || 0;
          allTranscripts.push(response.transcript || '');
          allQuestions.push(response.questionText || '');
        }
      });

      const avgWordsPerResponse = Math.round(totalWords / Object.keys(responses).length);
      const avgDuration = Math.round(totalDuration / Object.keys(responses).length);
      const fillerWordRate = totalWords > 0 ? (totalFillerWords / totalWords * 100).toFixed(1) : 0;

      const prompt = `
        Analyze this complete behavioral interview performance and provide comprehensive feedback:
        
        Overall Performance:
        - Questions answered: ${Object.keys(responses).length}
        - Overall score: ${overallScore}%
        - Total words spoken: ${totalWords}
        - Average words per response: ${avgWordsPerResponse}
        - Average response duration: ${avgDuration} seconds
        - Filler word rate: ${fillerWordRate}%
        
        Questions and Responses:
        ${allQuestions.map((q, i) => `
        Q${i+1}: ${q}
        Response: ${allTranscripts[i].substring(0, 200)}...
        `).join('\n')}
        
        Provide overall interview feedback with:
        1. 3 key strengths across all responses (overall patterns)
        2. 3 priority areas for improvement 
        3. 3 actionable tips for future interviews
        
        Focus on:
        - Storytelling consistency and structure (STAR method usage)
        - Communication patterns across responses
        - Leadership/impact demonstration
        - Areas where they showed growth or consistency
        
        Format as JSON:
        {
          "overallStrengths": ["strength 1", "strength 2", "strength 3"],
          "priorityImprovements": ["improvement 1", "improvement 2", "improvement 3"],
          "interviewTips": ["tip 1", "tip 2", "tip 3"],
          "readinessAssessment": "brief assessment of interview readiness"
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ 
          role: "user", 
          content: prompt 
        }],
        max_tokens: 1000,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      // Calculate cost
      const totalTokens = completion.usage.total_tokens;
      const estimatedCost = (totalTokens / 1000) * 0.0001;
      
      console.log(`📊 Overall Feedback API Call:`);
      console.log(`   Total tokens: ${totalTokens}`);
      console.log(`   Estimated cost: $${estimatedCost.toFixed(6)}`);

      const overallFeedback = JSON.parse(completion.choices[0].message.content);

      // Save overall feedback to database if sessionId provided
      if (sessionId) {
        await db.ref(`interviews/${sessionId}/overallFeedback`).set({
          ...overallFeedback,
          generatedAt: admin.database.ServerValue.TIMESTAMP,
          model: "gpt-4o-mini",
          cost: estimatedCost,
          performanceMetrics: {
            overallScore,
            totalWords,
            avgWordsPerResponse,
            avgDuration,
            fillerWordRate: parseFloat(fillerWordRate),
            questionsAnswered: Object.keys(responses).length
          }
        });
      }

      return res.json({
        success: true,
        overallFeedback,
        metadata: {
          tokens: totalTokens,
          cost: estimatedCost,
          model: "gpt-4o-mini"
        }
      });

    } catch (error) {
      console.error('Error generating overall feedback:', error);
      return res.status(500).json({ 
        error: 'Failed to generate overall feedback',
        details: error.message
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