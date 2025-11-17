const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const cors = require('cors')({ origin: true });
const OpenAI = require('openai');
require('dotenv').config();
const { createClient } = require('@deepgram/sdk');
const {onSchedule} = require("firebase-functions/scheduler");
const { Readable } = require('stream');
const {defineSecret} = require('firebase-functions/params');

// Define secrets for Stripe
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

// Lazy initialization of Stripe - secrets are only available inside functions
let stripe;
function getStripe() {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    stripe = require('stripe')(apiKey);
  }
  return stripe;
}

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.database();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});
const deepgramClient = createClient(process.env.VITE_DEEPGRAM_API_KEY);

// Utility function to extract questions from text
function extractQuestions(text, maxQuestions = 10) {
  const questions = text
    .split(/\d+\.\s/)
    .filter(Boolean)
    .map(q => q.trim())
    .filter(q => q.length > 10)
    .slice(0, maxQuestions);

  console.log(`Extracted ${questions.length} questions (max: ${maxQuestions})`);
  return questions;
}

// Helper function to extract action words from transcript
function extractActionWords(text) {
  const commonActionWords = [
    "achieved", "analyzed", "built", "collaborated", "created", "delivered", "developed",
    "directed", "implemented", "improved", "increased", "led", "managed", "organized",
    "resolved", "worked", "decided", "approached", "mentored", "refactored", "organize",
    "resolve", "work", "decide", "approach", "mentor", "implement", "refactor", "develop",
    "deliver", "achieve", "analyze", "build", "collaborate", "create", "direct"
  ];

  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return commonActionWords.filter(actionWord => words.includes(actionWord));
}

// Helper function to extract filler words from transcript
function extractFillerWords(text) {
  const commonFillerWords = [
    "um", "uh", "uhm", "hmm", "like", "you know", "actually", "i think", "guess",
    "basically", "literally", "so", "well", "kind of", "sort of", "maybe",
    "er", "ah", "huh", "right", "okay", "alright", "just", "anyway", "I mean",
    "sorta", "kinda", "like I said", "you see", "as I said", "or something",
    "if that makes sense", "you know what I mean", "let's see", "so yeah", "so basically"
  ];

  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return commonFillerWords.filter(fillerWord => words.includes(fillerWord));
}

// Helper function to extract statistics/numbers from transcript
function extractStats(text) {
  const numberPattern = /\b\d+(?:\.\d+)?(?:%|percent|million|billion|thousand|k|m|b)?\b/gi;
  return text.match(numberPattern) || [];
}

// Helper function for harmonic points calculation
function harmonicPoints(count) {
  let points = 0;
  for (let i = 1; i <= count; i++) {
    points += 1 / i;
  }
  return points;
}

// Calculate performance score using diminishing returns algorithm
function calculatePerformanceScore({starAnswerParsed, responseTime, wordCount, fillerWords, actionWords, statsUsed, interviewerDifficulty = 'easy-going-personality'}) {
  // Input validation
  if (!starAnswerParsed || !responseTime || !wordCount || fillerWords < 0 || actionWords < 0 || statsUsed < 0) {
    return 0;
  }

  // Hard penalize little to no response
  if (wordCount < 10) {
    return Math.round((wordCount * 1.5) * 0.6);
  }

  let score = 100;

  // Difficulty multipliers
  const getDifficultyMultipliers = (difficulty) => {
    switch (difficulty) {
      case 'challenging-personality':
        return { penaltyMultiplier: 1.4, bonusMultiplier: 0.8, baseThreshold: 0.9 };
      case 'moderate-personality':
        return { penaltyMultiplier: 1.2, bonusMultiplier: 0.9, baseThreshold: 0.95 };
      case 'easy-going-personality':
      default:
        return { penaltyMultiplier: 1.0, bonusMultiplier: 1.0, baseThreshold: 1.0 };
    }
  };

  const { penaltyMultiplier, bonusMultiplier, baseThreshold } = getDifficultyMultipliers(interviewerDifficulty);

  // Penalize extremely long response
  if (responseTime > 300) {
    score -= Math.min((responseTime - 300) * 0.05 * penaltyMultiplier, 10 * penaltyMultiplier);
  }

  // Response time penalty
  const minResponseTime = 20 * baseThreshold;
  if (responseTime < minResponseTime) {
    const deduction = Math.min((60 - responseTime) * 0.2 * penaltyMultiplier, 12 * penaltyMultiplier);
    score -= deduction;
  }

  // Word count penalty
  const minWordCount = 50 * baseThreshold;
  if (wordCount < minWordCount) {
    const deduction = Math.min((100 - wordCount) * 0.07 * penaltyMultiplier, 7 * penaltyMultiplier);
    score -= deduction;
  }

  // Filler words penalty
  if (wordCount > 0) {
    const ratio = fillerWords / wordCount;
    const fillerThreshold = 0.05 * baseThreshold;
    if (ratio > fillerThreshold) {
      const excess = ratio - fillerThreshold;
      const deduction = Math.min(Math.pow(excess * 100, 1.2) * penaltyMultiplier, 15 * penaltyMultiplier);
      score -= deduction;
    }
  }

  // Long response penalty
  if (wordCount > 300) {
    const deduction = Math.min((wordCount - 300) * 0.05 * penaltyMultiplier, 5 * penaltyMultiplier);
    score -= deduction;
  }

  // Action words points
  score += harmonicPoints(actionWords) * 1.2 * bonusMultiplier;

  // Stats used points
  score += harmonicPoints(statsUsed) * bonusMultiplier;

  // Time efficiency bonus
  if (responseTime >= 60 && responseTime <= 180) {
    const bonus = ((responseTime - 60) / (180 - 60)) * 5 * bonusMultiplier;
    score += bonus;
  }

  // Words per second consistency penalty
  const wordsPerSecond = wordCount / responseTime;
  if (wordsPerSecond < 1) {
    score -= Math.min((1 - wordsPerSecond) * 20 * penaltyMultiplier, 10 * penaltyMultiplier);
  } else if (wordsPerSecond > 4) {
    score -= Math.min((wordsPerSecond - 4) * 10 * penaltyMultiplier, 10 * penaltyMultiplier);
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Scale score to be out of 60
  score = Math.round(score * 0.6);

  // Calculate STAR component scores
  let situationScore = starAnswerParsed.situation ? 10 : 0;
  if (starAnswerParsed.situation) {
    const situationWordCount = starAnswerParsed.situation.trim().split(/\s+/).length;
    if (situationWordCount < 20) {
      situationScore -= (20 - situationWordCount);
      situationScore = Math.max(situationScore, 0);
    }
  }

  let taskScore = starAnswerParsed.task ? 10 : 0;
  if (starAnswerParsed.task) {
    const taskWordCount = starAnswerParsed.task.trim().split(/\s+/).length;
    if (taskWordCount < 20) {
      taskScore -= (20 - taskWordCount);
      taskScore = Math.max(taskScore, 0);
    }
  }

  let actionScore = starAnswerParsed.action ? 10 : 0;
  if (starAnswerParsed.action) {
    const actionWordCount = starAnswerParsed.action.trim().split(/\s+/).length;
    if (actionWordCount < 20) {
      actionScore -= (20 - actionWordCount);
      actionScore = Math.max(actionScore, 0);
    }
  }

  let resultScore = starAnswerParsed.result ? 10 : 0;
  if (starAnswerParsed.result) {
    const resultWordCount = starAnswerParsed.result.trim().split(/\s+/).length;
    if (resultWordCount < 20) {
      resultScore -= (20 - resultWordCount);
      resultScore = Math.max(resultScore, 0);
    }
  }

  return score + situationScore + taskScore + actionScore + resultScore;
}

const verifyRecaptcha = functions.https.onRequest(async (req, res) => {
  console.log("Verifying Recaptcha...");
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Missing token" });
    }

    const secretKey = process.env.VITE_GOOGLE_RECAPTCHA_SECRET_KEY || '';

    try {
      const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secretKey}&response=${token}`,
      });

      const data = await response.json();

      if (data.success && (data.score === undefined || data.score >= 0.5)) {
        return res.json({ success: true, score: data.score });
      } else {
        return res.json({ success: false, message: "Failed verification", score: data.score });
      }
    } catch (error) {
      console.error("Error verifying reCAPTCHA:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
});

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


// Generate Questions Function
const generateResumeQuestions = functions.https.onRequest((req, res) => {
  console.log("Generating questions for provided resume...");
  return cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { job_role, company, numQuestions, interviewerDifficulty, resume } = req.body;
      console.log("Resume: ", resume);
      const companyContext = company ? ` at ${company}` : '';
      const prompt = `
        Generate EXACTLY ${numQuestions} interview questions for a ${job_role || 'general'} job position ${companyContext}, given the following resume text.
        Resume: ${resume}
        IMPORTANT: Generate ONLY ${numQuestions} questions. No more, no less.

        Rules:
        - Format strictly as: "1. [Question]", "2. [Question]", etc.
        - Do NOT include any introductory text, titles, or explanations outside the numbered format.
        - Each question should only have one question mark max. There should be no multiple questions in one question. Make sure each question will not require the user to talk for over 5 minutes.
        - For the questions, factor in the interviewerDifficulty level: ${interviewerDifficulty || 'medium'}.
        - For example, if interviewerDifficulty is "Intense", include more challenging questions that require deep reflection and problem-solving and be more harsh in the question.
        - If interviewerDifficulty is "Professional", include a balanced mix of common and moderately challenging questions and deliver them in a standard corporate interview style
        - If interviewerDifficulty is "Easy-going", include more straightforward and common questions that are easier to answer and deliver them in a friendly and relaxed manner.
        - Ensure questions are clear, concise, and relevant to the specified job role.
        - Tailor your questions to the resume provided. For example, if they have worked on an algorithmn for a class, ask them technical questions about the specifics, challenges they faced, how they resolved them, and the outcome.
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
      console.error('Error in generateResumeQuestions:', err);
      return res.status(500).json({ error: err.message });
    }
  });
});

// Text to Speech Function using Lemonfox API
const handleTextToSpeech = functions.https.onRequest((req, res) => {
  console.log("Converting text to speech with Lemonfox");
  return cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
      }

      const { text, voice = 'sky', speed = 1.0 } = req.body;

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

      // Prepare request to Lemonfox API
      const lemonfoxPayload = {
        input: text,
        voice: voice,
        language: 'en-us',
        response_format: 'mp3',
        speed: speed
      };

      console.log("Sending request to Lemonfox TTS API...");

      const lemonfoxResponse = await fetch('https://api.lemonfox.ai/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.LEMONFOX_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lemonfoxPayload)
      });

      if (!lemonfoxResponse.ok) {
        const errorText = await lemonfoxResponse.text();
        throw new Error(`Lemonfox API error: ${lemonfoxResponse.status} - ${errorText}`);
      }

      const audioBuffer = await lemonfoxResponse.arrayBuffer();
      const audioBufferNode = Buffer.from(audioBuffer);

      if (!audioBufferNode || audioBufferNode.length === 0) {
        throw new Error("No audio content received from Lemonfox API");
      }

      // Calculate Lemonfox TTS cost (~$2.50 per 1M characters)
      const characterCount = text.length;
      const estimatedCost = (characterCount / 1000000) * 2.50;

      console.log("✅ Text-to-speech successful");
      console.log(`Audio content size: ${audioBufferNode.length} bytes`);
      console.log(`💰 Lemonfox TTS API Call Cost:`);
      console.log(`   Characters processed: ${characterCount}`);
      console.log(`   Estimated cost: $${estimatedCost.toFixed(6)}`);

      // Set headers for audio stream
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Content-Length", audioBufferNode.length);

      // Send the audio buffer
      return res.send(audioBufferNode);

    } catch (error) {
      console.error("Error in text-to-speech:", error);

      return res.status(500).json({
        error: "Text-to-speech failed",
        details: error.message
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

      const { userId, sessionId, questionNumber, questionText, recordedTime, audioData, mimetype, interviewerDifficulty } = req.body;
      
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

          - Finally, using the improvedResponse, extract the response into the STAR interview method components and fill in the starAnswerParsedImproved variable using the following rules:
        
            starAnswerParsedImproved Important rules:
          - DO NOT summarize, rephrase, or clean the text.
          - DO NOT add periods at the end of values.
          - DO NOT make up any information.
          - Keep filler words, stutters, and unfinished phrases exactly as in the transcript.
          - Output ONLY valid JSON with exactly 4 keys: situation, task, action, result.

           Example Input Transcript:
          "In one of my school projects, I was tasked with building a database system, but I initially had no experience with SQL. To overcome this, I quickly learned SQL through online tutorials and hands-on practice. I then designed and implemented a fully functional database that met all project requirements. As a result, I gained valuable experience in database design and significantly improved my technical confidence"

          Example Output JSON:
          {
            "situation": "In one of my school projects",
            "task": "I was tasked with building a database system, but I initially had no experience with SQL",
            "action": "To overcome this, I quickly learned SQL through online tutorials and hands-on practice. I then designed and implemented a fully functional database that met all project requirements",
            "result": "As a result, I gained valuable experience in database design and significantly improved my technical confidence"
          }
            Now analyze the transcript from above (not the example transcript) and fill in the starAnswerParsedImproved variable.

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

      // Extract action words, filler words, and stats from transcript
      const actionWordsList = extractActionWords(transcript);
      const fillerWordsList = extractFillerWords(transcript);
      const statsUsedList = extractStats(transcript);

      console.log(`Metrics extracted - Action words: ${actionWordsList.length}, Filler words: ${fillerWordsList.length}, Stats: ${statsUsedList.length}`);

      // Calculate overall performance score
      const overallScore = calculatePerformanceScore({
        starAnswerParsed: starAnswerParsed || {},
        responseTime: durationSeconds,
        wordCount: totalWords,
        fillerWords: fillerWordsList.length,
        actionWords: actionWordsList.length,
        statsUsed: statsUsedList.length,
        interviewerDifficulty: interviewerDifficulty || 'easy-going-personality'
      });

      console.log(`Overall score calculated: ${overallScore}`);

      // Prepare response data
      const responseData = {
        questionNumber: parseInt(questionNumber),
        questionText: questionText || "",
        transcript,
        analysis: {
          totalWords,
          wordsPerMinute,
          technology: technology || [],
          questionTypes: questionTypes || [],
          strengths: strengths || [],
          tips: tips || [],
          starAnswerParsed: starAnswerParsed || {},
          starAnswerParsedImproved: starAnswerParsedImproved || {},
          improvedResponse: improvedResponse || null,
          overallScore: overallScore,
          actionWordCount: actionWordsList.length,
          fillerWordCount: fillerWordsList.length,
          statsUsedCount: statsUsedList.length
        },
        recordedTime: recordedTime || 0,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      };


      // Save to Firebase
      await db.ref(`interviews/${userId}/${sessionId}/responses/${questionNumber}`).set(responseData);
     
      const responsesRef = db.ref(`responses`);
      const newResponseRef = responsesRef.push();

      await newResponseRef.set({
        userId: userId,
        sessionId: sessionId,
        timestamp: Date.now()
      });

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

const cleanupOldTier1Interviews = onSchedule("every day 00:00", async (event) => {
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

  try {
    const responsesSnapshot = await db.ref('responses').once('value');

    if (!responsesSnapshot.exists()) {
      console.log("No responses found.");
      return null;
    }

    const responses = responsesSnapshot.val();
    const deletions = {};

    for (const [responseKey, responseData] of Object.entries(responses)) {
      const { userId, sessionId, timestamp } = responseData;

      if (!userId || !sessionId || !timestamp) {
        console.warn(`Skipping invalid response entry: ${responseKey}`);
        continue;
      }

      if (now - timestamp > THIRTY_DAYS) {
        // Delete entire session in interviews
        await db.ref(`interviews/${userId}/${sessionId}`).remove();
        console.log(`Deleted session ${sessionId} for user ${userId}`);

        // Optionally delete the response itself
        deletions[responseKey] = null;
      }
    }

    if (Object.keys(deletions).length > 0) {
      await db.ref('responses').update(deletions);
      console.log(`Deleted ${Object.keys(deletions).length} old response entries.`);
    } else {
      console.log("No responses older than 30 days found.");
    }

    return null;
  } catch (error) {
    console.error("Error cleaning up old interviews:", error);
    return null;
  }
});


// Create Stripe Checkout Session
const createCheckoutSession = functions.https.onCall(
  { secrets: [stripeSecretKey] },
  async (data, context) => {
    try {
      console.log('createCheckoutSession called');
      console.log('context.auth:', context?.auth);

      // Extract from data.data (Firebase callable functions wrap the payload)
      const { userId, priceId, planName } = data.data || data;

      if (!userId || !priceId) {
        console.error('Missing required fields. userId:', userId, 'priceId:', priceId);
        throw new functions.https.HttpsError('invalid-argument', 'Missing userId or priceId');
      }

      // Get or create Stripe customer
      const userRef = db.ref(`users/${userId}`);
      const userSnapshot = await userRef.once('value');
      const userData = userSnapshot.val();

      // Determine if we're in test mode based on the API key
      const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
      const customerIdField = isTestMode ? 'stripeCustomerIdTest' : 'stripeCustomerId';

      let customerId = userData?.subscription?.[customerIdField];

      // Verify customer exists in Stripe, create new one if not
      if (customerId) {
        try {
          await getStripe().customers.retrieve(customerId);
        } catch (error) {
          // Customer doesn't exist in this mode, create a new one
          console.log(`Customer ${customerId} not found in ${isTestMode ? 'test' : 'live'} mode, creating new customer`);
          customerId = null;
        }
      }

      if (!customerId) {
        // Create new Stripe customer
        const customer = await getStripe().customers.create({
          email: userData?.personalInformation?.email,
          metadata: {
            firebaseUserId: userId,
            mode: isTestMode ? 'test' : 'live'
          }
        });
        customerId = customer.id;

        // Save customer ID to Firebase under subscription object
        await db.ref(`users/${userId}/subscription`).update({
          [customerIdField]: customerId
        });
        console.log(`Created new ${isTestMode ? 'test' : 'live'} mode customer: ${customerId}`);
      }

      // Create checkout session
      const session = await getStripe().checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/settings?tab=plan&success=true`,
        cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/settings?tab=plan&canceled=true`,
        metadata: {
          userId,
          planName
        }
      });

      return { sessionId: session.id, url: session.url };

    } catch (error) {
      console.error('Error creating checkout session:', error.message || 'Unknown error');
      const errorMessage = error.message || 'Failed to create checkout session';
      throw new functions.https.HttpsError('internal', errorMessage);
    }
});

// Stripe Webhook Handler
const stripeWebhook = functions.https.onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Get the raw body - Firebase Cloud Functions provides it as req.rawBody
  let rawBody;
  if (req.rawBody) {
    // rawBody is already available (Firebase Cloud Functions)
    rawBody = req.rawBody;
  } else if (Buffer.isBuffer(req.body)) {
    // Body is already a Buffer
    rawBody = req.body;
  } else if (typeof req.body === 'string') {
    // Body is a string, convert to Buffer
    rawBody = Buffer.from(req.body);
  } else {
    // Body was parsed as JSON, this won't work for webhook verification
    console.error('Request body was parsed as JSON. Stripe webhooks require raw body.');
    return res.status(400).send('Webhook Error: Invalid body format');
  }

  console.log('Webhook received:', {
    hasSignature: !!sig,
    hasSecret: !!webhookSecret,
    secretPrefix: webhookSecret?.substring(0, 10),
    rawBodyLength: rawBody?.length,
    rawBodyType: typeof rawBody,
    isBuffer: Buffer.isBuffer(rawBody)
  });

  let event;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = await getStripe().checkout.sessions.retrieve(
          event.data.object.id,
          { expand: ['subscription'] }
        );
        await handleCheckoutSessionCompleted(session);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handleInvoicePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await handleInvoicePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to handle successful checkout
async function handleCheckoutSessionCompleted(session) {
  console.log('🔵 handleCheckoutSessionCompleted V3 - START');
  try {
    const userId = session.metadata.userId;
    const planName = session.metadata.planName;
    const subscriptionId = typeof session.subscription === 'object' ? session.subscription.id : session.subscription;

    console.log('🔵 V3 Processing checkout for userId:', userId, 'planName:', planName, 'subscriptionId:', subscriptionId);

    // Fetch the full subscription object
    console.log('🔵 V3 Fetching subscription from Stripe...');
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price']
    });
    console.log('🔵 V3 Subscription fetched');

    // Determine billing cycle from the subscription interval
    const interval = subscription.items.data[0].price.recurring.interval;
    const billingCycle = interval === 'year' ? 'annual' : 'monthly';

    // Use subscription dates if available, otherwise calculate from session
    let startTimestamp, endTimestamp;

    if (subscription.current_period_start && subscription.current_period_end) {
      console.log('🔵 V3 Using subscription period dates');
      startTimestamp = subscription.current_period_start;
      endTimestamp = subscription.current_period_end;
    } else {
      console.log('🔵 V3 Subscription dates not available, calculating from session created time');
      // Use session created time as start, calculate end based on interval
      startTimestamp = session.created;
      const startDate = new Date(startTimestamp * 1000);

      // Calculate renewal date based on billing cycle
      if (interval === 'year') {
        startDate.setFullYear(startDate.getFullYear() + 1);
      } else {
        startDate.setMonth(startDate.getMonth() + 1);
      }

      endTimestamp = Math.floor(startDate.getTime() / 1000);
    }

    console.log('🔵 V3 Dates - start:', startTimestamp, 'end:', endTimestamp);

    const startDate = new Date(startTimestamp * 1000);
    const renewalDate = new Date(endTimestamp * 1000);

    const startDateStr = startDate.toISOString().split('T')[0];
    const renewalDateStr = renewalDate.toISOString().split('T')[0];

    console.log('🔵 V3 Formatted dates - start:', startDateStr, 'renewal:', renewalDateStr);

    await db.ref(`users/${userId}/subscription`).update({
      tier: planName.toLowerCase(),
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: subscription.customer,
      status: 'active',
      billingCycle: billingCycle,
      startDate: startDateStr,
      renewalDate: renewalDateStr,
    });

    console.log(`✅ V3 Subscription activated for user ${userId}, tier: ${planName}, billingCycle: ${billingCycle}, renewalDate: ${renewalDateStr}`);
  } catch (error) {
    console.error('🔴 V3 Error in handleCheckoutSessionCompleted:', error);
    throw error;
  }
}

// Helper function to handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;

  // Find user by Stripe customer ID (check both test and live)
  const usersRef = db.ref('users');
  let snapshot = await usersRef.orderByChild('subscription/stripeCustomerId').equalTo(customerId).once('value');

  if (!snapshot.exists()) {
    // Try test mode customer ID
    snapshot = await usersRef.orderByChild('subscription/stripeCustomerIdTest').equalTo(customerId).once('value');
  }

  if (!snapshot.exists()) {
    console.log('No user found for customer:', customerId);
    return;
  }

  const userId = Object.keys(snapshot.val())[0];
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  await db.ref(`users/${userId}/subscription`).update({
    status: subscription.status,
    renewalDate: currentPeriodEnd.toISOString().split('T')[0],
  });

  console.log(`Subscription updated for user ${userId}`);
}

// Helper function to handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;

  // Find user by Stripe customer ID (check both test and live)
  const usersRef = db.ref('users');
  let snapshot = await usersRef.orderByChild('subscription/stripeCustomerId').equalTo(customerId).once('value');

  if (!snapshot.exists()) {
    // Try test mode customer ID
    snapshot = await usersRef.orderByChild('subscription/stripeCustomerIdTest').equalTo(customerId).once('value');
  }

  if (!snapshot.exists()) {
    console.log('No user found for customer:', customerId);
    return;
  }

  const userId = Object.keys(snapshot.val())[0];

  await db.ref(`users/${userId}/subscription`).update({
    tier: 'free', // Reset to free tier
    status: 'cancelled',
    stripeSubscriptionId: null,
  });

  console.log(`Subscription cancelled for user ${userId}, reset to free tier`);
}

// Helper function to handle successful payment
async function handleInvoicePaymentSucceeded(invoice) {
  const customerId = invoice.customer;

  // Find user by Stripe customer ID (check both test and live)
  const usersRef = db.ref('users');
  let snapshot = await usersRef.orderByChild('subscription/stripeCustomerId').equalTo(customerId).once('value');

  if (!snapshot.exists()) {
    // Try test mode customer ID
    snapshot = await usersRef.orderByChild('subscription/stripeCustomerIdTest').equalTo(customerId).once('value');
  }

  if (!snapshot.exists()) return;

  const userId = Object.keys(snapshot.val())[0];
  const billingHistoryRef = db.ref(`users/${userId}/subscription/billingHistory`);

  // Add to billing history under subscription
  await billingHistoryRef.push({
    id: invoice.id,
    date: new Date(invoice.created * 1000).toISOString().split('T')[0],
    amount: `$${(invoice.amount_paid / 100).toFixed(2)}`,
    status: 'paid',
    invoiceUrl: invoice.hosted_invoice_url
  });

  console.log(`Payment succeeded for user ${userId}`);
}

// Helper function to handle failed payment
async function handleInvoicePaymentFailed(invoice) {
  const customerId = invoice.customer;

  // Find user by Stripe customer ID (check both test and live)
  const usersRef = db.ref('users');
  let snapshot = await usersRef.orderByChild('subscription/stripeCustomerId').equalTo(customerId).once('value');

  if (!snapshot.exists()) {
    // Try test mode customer ID
    snapshot = await usersRef.orderByChild('subscription/stripeCustomerIdTest').equalTo(customerId).once('value');
  }

  if (!snapshot.exists()) return;

  const userId = Object.keys(snapshot.val())[0];

  await db.ref(`users/${userId}/subscription`).update({
    status: 'past_due',
  });

  console.log(`Payment failed for user ${userId}`);
}

// Cancel Subscription
const cancelSubscription = functions.https.onRequest(
  { secrets: [stripeSecretKey] },
  (req, res) => {
  console.log("Cancelling subscription...");
  return cors(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }

      const userRef = db.ref(`users/${userId}/subscription`);
      const snapshot = await userRef.once('value');
      const subscriptionData = snapshot.val();

      if (!subscriptionData?.stripeSubscriptionId) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      // Cancel at period end (user keeps access until end of billing period)
      await getStripe().subscriptions.update(subscriptionData.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      await userRef.update({
        tier: 'free',
        status: 'cancelled'
      });

      console.log(`Successfully cancelled subscription for user ${userId}`);
      return res.json({ success: true, message: 'Subscription will be cancelled at period end' });

    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});


module.exports = {
  generateQuestions,
  generateResumeQuestions,
  handleTextToSpeech,
  saveResponse,
  getInterviewResults,
  verifyRecaptcha,
  cleanupOldTier1Interviews,
  createCheckoutSession,
  stripeWebhook,
  cancelSubscription
};
