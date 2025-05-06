from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
import openai
import os
import re
from dotenv import load_dotenv
import io
import requests
import json
import asyncio
import logging
from deepgram import (
    DeepgramClient,
    ClientOptionsFromEnv,
    SpeakOptions,
    DeepgramClientOptions,
    FileSource,
    PrerecordedOptions,
)
import httpx
import aiofiles
from datetime import datetime
from deepgram.utils import verboselogs

dotenv_path = "/Users/rachelpu/Coding/WiNG-it/.env.local"
if not os.path.exists(dotenv_path):
    print("❌ .env file not found")
else:
    load_dotenv(dotenv_path)

# Ensure API key is loaded
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    raise ValueError("❌ OPENAI_API_KEY is not set. Check your .env file and path.")


AUDIO_FILE = "preamble.wav"

# For frontend req
app = Flask(__name__)
CORS(app)

@app.route("/generate_questions", methods=["POST"])
def generate_questions():
    try:
        data = request.json
        job_role = data.get("job_role", "").strip()
        numQuestions = data.get("numQuestions")
        questionTypes = data.get("questionTypes")
        interviewerDifficulty = data.get("interviewerDifficulty", "general").replace("-", " ")

        print(numQuestions)
        print(questionTypes)
        print(interviewerDifficulty)

        prompt = f"""

        Generate {numQuestions} behavioral interview questions related to {questionTypes} for a {job_role if job_role else "general"} role in the technology industry.
        Simulate an interviewer with a {interviewerDifficulty} style.
        - Format strictly as: "1. [Question]", "2. [Question]", etc.
        - Do NOT include any introductory text, titles, or explanations.
        - Each question should only have one question mark max. There should be no multiple questions in one question. Make sure each question will not require the user to talk for over 5 minutes.
        - Combine this introduction into the first question you write. Introduce yourself before going into the question. Please introduce yourself as "Winnie" and say that you are the
           interviewer. Then afterwards, say "It's nice to meet you. Let's get started with the interview." before going into the first question.
           For instance, you should be saying "1. Hi, I'm Winnie. It's nice to meet you. Let's get started with the interview. [Question]".
        - After the last question, say "Thank you for your time. I will get back to you soon.". For example, if the user asks to do 5 questions, after the 5th question, do "6. Thank you for your time. I will get back to you soon.".

        """

        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        raw_questions = response.choices[0].message.content
        questions = extract_questions(raw_questions)
        print(questions)

#         return the array of questions

        return jsonify({
            "questions": questions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def extract_questions(gpt_response):
    # Split into lines and keep only lines starting with a number
    print(gpt_response)
    questions = []
    for line in gpt_response.split("\n"):
        line = line.strip()
        if re.match(r'^\d+\.', line):
            # Remove the number + dot and any extra spaces
            cleaned = re.sub(r'^\d+\.\s*', '', line)
            questions.append(cleaned)
    return questions


@app.route("/text-to-speech", methods=["POST"])
def text_to_speech():
    try:
        data = request.json
        text_to_speak = data.get("text", "").strip()

        if not text_to_speak:
            return jsonify({"error": "No text provided"}), 400

        # Initialize Deepgram client
        deepgram = DeepgramClient(
            api_key="", config=ClientOptionsFromEnv(verbose=verboselogs.SPAM))

        # Stream options
        options = SpeakOptions(
            model="aura-asteria-en",
        )

        # Generate audio stream
        response = deepgram.speak.rest.v("1").stream(
            {"text": text_to_speak},
            options
        )

        # Stream the audio directly to the client
        return Response(
            response.stream,
            mimetype="audio/mpeg",
            headers={
                "Content-Disposition": "inline",  # Play in browser instead of downloading
                "Cache-Control": "no-cache"      # Prevent caching if needed
            }
        )

    except Exception as e:
        print(f"Exception: {e}")

@app.route("/speech-to-text", methods=["POST"])
async def speech_to_text():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio']
        audio_data = audio_file.read()

        # Initialize Deepgram client
        deepgram = DeepgramClient("")  # API key from env

        # Configure transcription options
        options = PrerecordedOptions(
            model="nova-3",
            smart_format=True,
            utterances=True,
            punctuate=True,
            diarize=True
        )

        payload = {
            "buffer": audio_data,
            "mimetype": audio_file.mimetype  # e.g., 'audio/wav'
        }

        # Transcribe the audio
        response = await deepgram.listen.asyncrest.v("1").transcribe_file(
            payload,
            options,
            timeout=httpx.Timeout(300.0, connect=10.0)
        )

        # Return the transcription
        return jsonify({
            "transcript": response.results.channels[0].alternatives[0].transcript,
            "words": response.results.channels[0].alternatives[0].words
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)