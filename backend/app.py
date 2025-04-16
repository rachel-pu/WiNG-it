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
    LiveOptions,
)
import httpx
import aiofiles
from datetime import datetime
from deepgram.utils import verboselogs
import speech_recognition as sr
from flask_socketio import SocketIO, emit
import tempfile
import threading
import ssl

dotenv_path = "/Users/chelsn/WebstormProjects/WiNG-it/.env.local"
load_dotenv(dotenv_path)

# Ensure API key is loaded
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    raise ValueError("❌ OPENAI_API_KEY is not set. Check your .env file and path.")

# Initialize Deepgram client PROPERLY
try:
    dg_client = DeepgramClient(
        api_key=os.getenv("DEEPGRAM_API_KEY"),
        config=DeepgramClientOptions(
            options={"verify_ssl": True}  # Keep True for production
        )
    )
    print("✅ Deepgram client initialized successfully")
except Exception as e:
    print(f"❌ Deepgram initialization failed: {str(e)}")
    raise


# print(dg_client.usage.get())  # Should show your account status

AUDIO_FILE = "preamble.wav"

# For frontend req
app = Flask(__name__)
CORS(app)

# Initialize SocketIO for real-time audio streaming
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize speech recognizer
recognizer = sr.Recognizer()

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')

@app.route("/generate_questions", methods=["POST"])
def generate_questions():
    try:
        data = request.json
        job_role = data.get("job_role", "").strip()

        prompt = f"""
        Generate 5 behavioral interview questions for a {job_role if job_role else "general"} role.
        - Format strictly as: "1. [Question]", "2. [Question]", etc.
        - Do NOT include any introductory text, titles, or explanations.
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


@app.route("/save-and-transcribe", methods=["POST"])
def save_and_transcribe():
    try:
        # Check if audio file is in the request
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio']

        # Create a unique filename using timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"user_speech_{timestamp}.wav"
        file_path = os.path.join(tempfile.gettempdir(), filename)

        # Save the file
        audio_file.save(file_path)
        print(f"✅ Audio saved to {file_path}")

        # Transcribe using Deepgram
        with open(file_path, "rb") as audio:
            source = {"buffer": audio, "mimetype": "audio/wav"}
            options = PrerecordedOptions(
                model="nova",
                language="en-US",
                smart_format=True,
                filler_words=True
            )

            response = dg_client.listen.prerecorded.v("1").transcribe_file(source, options)

            # Get the transcript text
            transcript = response.results.channels[0].alternatives[0].transcript

            return jsonify({
                "success": True,
                "transcript": transcript,
                "file_path": file_path
            })

    except Exception as e:
        print(f"❌ Error in save_and_transcribe: {str(e)}")
        return jsonify({"error": str(e)}), 500

#
# active_connections = {}
#
# def handle_transcription(sid):
#     """Thread function to process Deepgram responses"""
#     connection = active_connections.get(sid)
#     try:
#         for response in connection.listen():
#             transcript = response.channel.alternatives[0].transcript
#             if transcript.strip():
#                 socketio.emit('transcription', {'text': transcript}, room=sid)
#     except Exception as e:
#         socketio.emit('error', {'message': str(e)}, room=sid)
#
# @socketio.on('start_recording')
# def handle_start_recording():
#     try:
#         # Use the new LiveClient API
#         options = LiveClientOptions(
#             model="nova",
#             language="en-US",
#             encoding="linear16",
#             sample_rate=16000,
#             punctuate=True
#         )
#
#         connection = dg_client.listen.live.v("1", options)
#         active_connections[request.sid] = connection
#
#         def listen_thread():
#             try:
#                 for response in connection.listen():
#                     if response.transcript:
#                         socketio.emit('transcription',
#                                    {'text': response.transcript},
#                                    room=request.sid)
#             except Exception as e:
#                 socketio.emit('error',
#                             {'message': str(e)},
#                             room=request.sid)
#
#         Thread(target=listen_thread).start()
#         emit('recording_started')
#
#     except Exception as e:
#         emit('error', {'message': str(e)})
#
#
# @socketio.on('audio_chunk')
# def handle_audio_chunk(data):
#     connection = active_connections.get(request.sid)
#     if connection:
#         connection.send(data['audio'])
#
# @socketio.on('disconnect')
# def handle_disconnect():
#     connection = active_connections.pop(request.sid, None)
#     if connection:
#         connection.finish()
#
#
#
# # Start the listener thread when app starts
# # threading.Thread(target=listen_for_transcriptions, daemon=True).start()
#

if __name__ == "__main__":
    app.run(debug=True)