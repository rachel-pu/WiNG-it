from flask import Flask, request, jsonify, send_file, Response, session, flash, redirect, url_for, render_template
from flask_cors import CORS
import openai
import os
import re
from dotenv import load_dotenv
import logging
import uuid
import tempfile
from datetime import datetime
from deepgram import (
    DeepgramClient,
    ClientOptionsFromEnv,
    SpeakOptions,
    DeepgramClientOptions,
    FileSource,
    PrerecordedOptions,
)
from deepgram.utils import verboselogs
from flask_session import Session


# Load environment variables
dotenv_path = "/Users/rachelpu/Coding/WiNG-it/.env.local"
if not os.path.exists(dotenv_path):
    print("❌ .env file not found")
else:
    load_dotenv(dotenv_path)

# Ensure API keys are loaded
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    raise ValueError("❌ OPENAI_API_KEY is not set. Check your .env file and path.")

DEEPGRAM_API_KEY = os.getenv('DEEPGRAM_API_KEY')
if not DEEPGRAM_API_KEY:
    print("⚠️ DEEPGRAM_API_KEY is not set. Some features may not work.")

# Initialize Deepgram client
dg_client = DeepgramClient(
    api_key=DEEPGRAM_API_KEY or "",
    config=ClientOptionsFromEnv(verbose=verboselogs.SPAM)
)

RESPONSES_STORE = {}  # Global storage (fallback)

# For frontend req
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev_secret_key_change_in_production')  # Add a secret key for session
CORS(app, supports_credentials=True)  # Enable CORS with credentials

app.config['SESSION_TYPE'] = 'filesystem'  # Stores sessions on disk
Session(app)

# Global dictionary to store responses if session is not working
RESPONSES_STORE = {}

@app.route("/generate_questions", methods=["POST"])
def generate_questions():
    try:
        data = request.json
        job_role = data.get("job_role", "").strip()
        numQuestions = data.get("numQuestions")
        questionTypes = data.get("questionTypes")

#         print(f"Generating {numQuestions} questions for {questionTypes} - {job_role}")

        prompt = f"""
        Generate {numQuestions} behavioral interview questions related to {questionTypes} for a {job_role if job_role else "general"} role in the technology industry.
        - Format strictly as: "1. [Question]", "2. [Question]", etc.
        - Do NOT include any introductory text, titles, or explanations.
        - Each question should only have one question mark max. There should be no multiple questions in one question. Make sure each question will not require the user to talk for over 5 minutes.
        - Combine this introduction into the first question you write. Introduce yourself before going into the question. Please introduce yourself as "Winnie" and say that you are the
           interviewer. Then afterwards, say "It's nice to meet you. Let's get started with the interview." before going into the first question.
           For instance, you should be saying "1. Hi, I'm Winnie. It's nice to meet you. Let's get started with the interview. [Question]".
        """

        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )

        raw_questions = response.choices[0].message.content
        questions = extract_questions(raw_questions)
#         print(f"Generated questions: {questions}")

        return jsonify({
            "questions": questions
        })

    except Exception as e:
        print(f"❌ Error in generate_questions: {str(e)}")
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

#         print(f"Converting to speech: {text_to_speak[:50]}...")

        # Initialize Deepgram client
        options = SpeakOptions(
            model="aura-asteria-en",
        )

        # Generate audio stream
        response = dg_client.speak.rest.v("1").stream(
            {"text": text_to_speak},
            options
        )

#         print("✅ Text-to-speech successful")

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
        print(f"❌ Error in text_to_speech: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/save-and-transcribe", methods=["POST"])
def save_and_transcribe():
    try:
        # Check if audio file is in the request
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        # Get the audio file
        audio_file = request.files['audio']

        # Get form data
        question_number = request.form.get('question_number', '0')
        question_text = request.form.get('question_text', 'Unknown question')
        session_id = request.form.get('session_id', str(uuid.uuid4()))

        # Create question key in format "1. First question"
        question_key = f"{question_number}. {question_text}"

        # Create a unique filename using timestamp and question number
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"user_speech_q{question_number}_{timestamp}.wav"
        file_path = os.path.join(tempfile.gettempdir(), filename)

        # Save the file
        audio_file.save(file_path)
        print(f"✅ Audio saved to {file_path}")

        # Transcribe using Deepgram
        try:
            with open(file_path, "rb") as audio:
                source = {"buffer": audio, "mimetype": "audio/wav"}
                options = PrerecordedOptions(
                    model="nova",
                    language="en-US",
                    smart_format=True,
                    filler_words=True
                )

                print("🔄 Transcribing with Deepgram...")
                response = dg_client.listen.prerecorded.v("1").transcribe_file(source, options)
                print("✅ Transcription completed")

                # Get the transcript text and words
                transcript = response.results.channels[0].alternatives[0].transcript

                # Extract filler words (if available)
                try:
                    words = response.results.channels[0].alternatives[0].words
                    filler_words = [word.word for word in words if word.word.lower() in
                                  ["um", "uh", "hmm", "like", "you know", "actually",
                                   "basically", "literally", "so", "well"]]
                except (AttributeError, IndexError):
                    print("⚠️ Could not extract filler words")
                    filler_words = []

                print(f"📝 Transcript: {transcript[:100]}...")
                print(f"🗣️ Filler words detected: {len(filler_words)}")

                # Create response dictionary with more structured data
                response_data = {
                    "transcript": transcript,
                    "filler_words": filler_words,
                    "file_path": file_path,
                    "question_text": question_text,
                    "question_number": question_number,
                    "timestamp": timestamp
                }

                # We'll use both session and a global dictionary for redundancy
                # Initialize global dictionary if it doesn't exist
                if not hasattr(app, 'all_responses'):
                    app.all_responses = {}

                # Store response by session_id and question_number for easy lookup
                if session_id not in app.all_responses:
                    app.all_responses[session_id] = {}

                app.all_responses[session_id][question_number] = response_data

                # Also try to store in session as a backup
                try:
                    if 'responses' not in session:
                        session['responses'] = {}

                    # Store response in session
                    session['responses'][question_number] = response_data
                    session.modified = True
                    print(f"✅ Response #{question_number} stored in session")
                except Exception as session_error:
                    print(f"⚠️ Session storage failed: {str(session_error)}")
                    # We already have the app.all_responses as backup

                # Also keep the RESPONSES_STORE for backward compatibility
                if session_id not in RESPONSES_STORE:
                    RESPONSES_STORE[session_id] = {}
                RESPONSES_STORE[session_id][question_key] = response_data

                # Count how many questions have been answered for this session
                questions_completed = len(app.all_responses.get(session_id, {}))

                # Check if all 5 questions have been completed
                all_completed = questions_completed >= 5

                # Return the data to the client
                return jsonify({
                    "success": True,
                    "question_number": question_number,
                    "question_key": question_key,
                    "response_data": response_data,
                    "session_id": session_id,
                    "questions_completed": questions_completed,
                    "all_completed": all_completed
                })

        except Exception as transcription_error:
            print(f"❌ Transcription error: {str(transcription_error)}")
            return jsonify({
                "error": f"Transcription failed: {str(transcription_error)}",
                "file_path": file_path  # Return the file path so the audio is not lost
            }), 500

    except Exception as e:
        print(f"❌ Error in save_and_transcribe: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add a new endpoint to retrieve all responses for a session
@app.route("/get-all-responses/<session_id>", methods=["GET"])
def get_all_responses(session_id):
    try:
        # Try to get responses from app.all_responses first
        if hasattr(app, 'all_responses') and session_id in app.all_responses:
            responses = app.all_responses[session_id]
        # Fall back to RESPONSES_STORE if needed
        elif session_id in RESPONSES_STORE:
            responses = RESPONSES_STORE[session_id]
        else:
            responses = {}

        # Check if we have all 5 responses
        has_all_responses = len(responses) >= 5

        return jsonify({
            "success": True,
            "session_id": session_id,
            "responses": responses,
            "complete": has_all_responses,
            "count": len(responses)
        })

    except Exception as e:
        print(f"❌ Error retrieving responses: {str(e)}")
        return jsonify({"error": str(e)}), 500


       # Add this to your Flask routes

@app.route("/results/<session_id>")
def display_results(session_id):
    # Get all responses for the session
    try:
        # Try to get responses from app.all_responses first
        if hasattr(app, 'all_responses') and session_id in app.all_responses:
            responses = app.all_responses[session_id]
        # Fall back to RESPONSES_STORE if needed
        elif session_id in RESPONSES_STORE:
            responses = RESPONSES_STORE[session_id]
        else:
            responses = {}

        # Check if we have all 5 responses
        has_all_responses = len(responses) >= 5

        if not has_all_responses:
            # Redirect to the questions page if not all questions are answered
            flash("Please complete all questions before viewing results.")
            return redirect(url_for('questions_page'))

        # Sort responses by question number
        sorted_responses = []
        for i in range(1, 6):  # Assuming 5 questions numbered 1-5
            if str(i) in responses:
                sorted_responses.append(responses[str(i)])

        # Render the results template with the responses
        return render_template(
            'results.html',
            responses=sorted_responses,
            session_id=session_id
        )

    except Exception as e:
        print(f"❌ Error displaying results: {str(e)}")
        flash("An error occurred while retrieving your responses.")
        return redirect(url_for('index'))


if __name__ == "__main__":
    # Set up logging
    logging.basicConfig(level=logging.INFO,
                      format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    print("🚀 Starting Flask server...")
    app.run(debug=True)