from flask import Flask, request, jsonify, send_file, Response, session, flash, redirect, url_for, render_template
from flask_cors import CORS
# Keep OpenAI as primary for now while you test the frontend fix
import openai
import google.generativeai as genai
import os
import re
import time
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
from functools import lru_cache
import json

# Load environment variables
dotenv_path = "/Users/rachelpu/Coding/WiNG-it/.env.local"
if not os.path.exists(dotenv_path):
    print("❌ .env file not found")
else:
    load_dotenv(dotenv_path)

# Keep OpenAI as primary for now - you can switch to Gemini later
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    raise ValueError("❌ OPENAI_API_KEY is not set. Check your .env file and path.")

# Configure Google Gemini API (commented out for now)
GOOGLE_API_KEY = os.getenv('GOOGLE_FLASH_API_KEY')
if not GOOGLE_API_KEY:
    print("⚠️ GOOGLE_API_KEY is not set. Question generation may not work.")
else:
    genai.configure(api_key=GOOGLE_API_KEY)
    print("✅ Google Gemini configured successfully")

# Keep OpenAI as fallback
OPENAI_FALLBACK = bool(openai.api_key)

DEEPGRAM_API_KEY = os.getenv('DEEPGRAM_API_KEY')
if not DEEPGRAM_API_KEY:
    print("⚠️ DEEPGRAM_API_KEY is not set. Some features may not work.")

# Initialize Deepgram client
dg_client = DeepgramClient(
    api_key=DEEPGRAM_API_KEY or "",
    config=ClientOptionsFromEnv(verbose=verboselogs.SPAM)
)

# Rate limiting and usage tracking
user_requests = {}
daily_usage = {"tokens": 0, "cost": 0.0, "date": datetime.now().date()}
DAILY_BUDGET = float(os.getenv('DAILY_BUDGET', '50.0'))  # $50 daily limit
MAX_REQUESTS_PER_HOUR = int(os.getenv('MAX_REQUESTS_PER_HOUR', '10'))  # 10 requests per user per hour

# Token pricing (per 1M tokens)
GEMINI_INPUT_COST = 0.15  # $0.15 per 1M input tokens
GEMINI_OUTPUT_COST = 0.60  # $0.60 per 1M output tokens

RESPONSES_STORE = {}  # Global storage (fallback)

# For frontend req
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev_secret_key_change_in_production')
CORS(app, supports_credentials=True)

app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Usage tracking functions
def track_usage(tokens_input, tokens_output, provider="gemini"):
    global daily_usage
    
    # Reset daily counter if new day
    if daily_usage["date"] != datetime.now().date():
        daily_usage = {"tokens": 0, "cost": 0.0, "date": datetime.now().date()}
    
    # Calculate cost based on provider
    if provider == "gemini":
        cost = (tokens_input * GEMINI_INPUT_COST / 1000000) + (tokens_output * GEMINI_OUTPUT_COST / 1000000)
    else:  # OpenAI fallback
        cost = (tokens_input + tokens_output) * 0.002 / 1000  # Rough estimate
    
    daily_usage["tokens"] += (tokens_input + tokens_output)
    daily_usage["cost"] += cost
    
    print(f"📊 Usage: +{tokens_input + tokens_output} tokens, +${cost:.4f} | Daily total: {daily_usage['tokens']} tokens, ${daily_usage['cost']:.2f}")
    
    return cost

def check_daily_budget():
    return daily_usage["cost"] < DAILY_BUDGET

def check_rate_limit(user_ip):
    current_time = time.time()
    if user_ip not in user_requests:
        user_requests[user_ip] = []
    
    # Remove old requests (older than 1 hour)
    user_requests[user_ip] = [req_time for req_time in user_requests[user_ip] 
                              if current_time - req_time < 3600]
    
    if len(user_requests[user_ip]) >= MAX_REQUESTS_PER_HOUR:
        return False
    
    user_requests[user_ip].append(current_time)
    return True

# Cache for common question combinations
@lru_cache(maxsize=50)
def generate_questions_cached(job_role, num_questions, question_types):
    """Cache frequently requested question combinations"""
    cache_key = f"{job_role}_{num_questions}_{question_types}"
    print(f"🔄 Cache miss for: {cache_key}")
    return None  # Will be handled by the main function

def generate_with_gemini(prompt):
    """Generate questions using Google Gemini"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=600,  # Limit output to control costs
                temperature=0.7,
                top_p=0.9,
            )
        )
        
        # Estimate token usage (rough calculation)
        input_tokens = len(prompt.split()) * 1.3  # Rough token estimation
        output_tokens = len(response.text.split()) * 1.3
        
        # Track usage and cost
        cost = track_usage(int(input_tokens), int(output_tokens), "gemini")
        
        return response.text, cost
        
    except Exception as e:
        print(f"❌ Gemini generation failed: {str(e)}")
        raise e

def generate_with_openai_fallback(prompt):
    """Fallback to OpenAI if Gemini fails"""
    if not OPENAI_FALLBACK:
        raise Exception("OpenAI fallback not available")
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",  # Most cost-effective GPT model
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.7
        )
        
        # Track usage
        input_tokens = response.usage.prompt_tokens
        output_tokens = response.usage.completion_tokens
        cost = track_usage(input_tokens, output_tokens, "openai")
        
        return response.choices[0].message.content, cost
        
    except Exception as e:
        print(f"❌ OpenAI fallback failed: {str(e)}")
        raise e

@app.route("/generate_questions", methods=["POST"])
def generate_questions():
    try:
        # Rate limiting check
        user_ip = request.remote_addr
        if not check_rate_limit(user_ip):
            return jsonify({
                "error": "Rate limit exceeded. Please try again in an hour.",
                "retry_after": 3600
            }), 429
        
        # Daily budget check
        if not check_daily_budget():
            return jsonify({
                "error": "Daily budget limit reached. Service will resume tomorrow.",
                "daily_cost": daily_usage["cost"]
            }), 503
        
        data = request.json
        job_role = data.get("job_role", "").strip()
        numQuestions = data.get("numQuestions")
        questionTypes = data.get("questionTypes")

        print(f"🤖 Generating {numQuestions} questions for {questionTypes} - {job_role}")

        prompt = f"""
        Generate {numQuestions} behavioral interview questions related to {questionTypes} for a {job_role if job_role else "general"} role in the technology industry.
        - Format strictly as: "1. [Question]", "2. [Question]", etc.
        - Do NOT include any introductory text, titles, or explanations.
        - Each question should only have one question mark max. There should be no multiple questions in one question. Make sure each question will not require the user to talk for over 5 minutes.
        - Combine this introduction into the first question you write. Introduce yourself before going into the question. Please introduce yourself as "Winnie" and say that you are the
           interviewer. Then afterwards, say "It's nice to meet you. Let's get started with the interview." before going into the first question.
           For instance, you should be saying "1. Hi, I'm Winnie. It's nice to meet you. Let's get started with the interview. [Question]".
        """

        provider_used = None
        response_text = None
        cost = 0

        # Try Gemini first
        try:
            print("🧠 Attempting generation with Gemini...")
            response_text, cost = generate_with_gemini(prompt)
            provider_used = "gemini"
            print("✅ Gemini generation successful")
            
        except Exception as gemini_error:
            print(f"⚠️ Gemini failed: {str(gemini_error)}")
            
            # Fallback to OpenAI
            if OPENAI_FALLBACK:
                try:
                    print("🔄 Falling back to OpenAI...")
                    response_text, cost = generate_with_openai_fallback(prompt)
                    provider_used = "openai"
                    print("✅ OpenAI fallback successful")
                    
                except Exception as openai_error:
                    print(f"❌ OpenAI fallback also failed: {str(openai_error)}")
                    return jsonify({
                        "error": "Both Gemini and OpenAI failed. Please try again later.",
                        "details": {
                            "gemini_error": str(gemini_error),
                            "openai_error": str(openai_error)
                        }
                    }), 500
            else:
                return jsonify({
                    "error": "Gemini failed and no fallback available. Please try again later.",
                    "details": str(gemini_error)
                }), 500

        # Extract questions from response
        questions = extract_questions(response_text)
        
        if not questions:
            return jsonify({"error": "No valid questions generated. Please try again."}), 500

        return jsonify({
            "questions": questions,
            "metadata": {
                "provider": provider_used,
                "cost": f"${cost:.4f}",
                "daily_usage": f"${daily_usage['cost']:.2f}",
                "daily_budget": f"${DAILY_BUDGET:.2f}",
                "budget_remaining": f"${DAILY_BUDGET - daily_usage['cost']:.2f}"
            }
        })

    except Exception as e:
        print(f"❌ Error in generate_questions: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again."}), 500

def extract_questions(gpt_response):
    # Split into lines and keep only lines starting with a number
    print("Generated response:", gpt_response[:200] + "..." if len(gpt_response) > 200 else gpt_response)
    questions = []
    for line in gpt_response.split("\n"):
        line = line.strip()
        if re.match(r'^\d+\.', line):
            # Remove the number + dot and any extra spaces
            cleaned = re.sub(r'^\d+\.\s*', '', line)
            if cleaned:  # Only add non-empty questions
                questions.append(cleaned)
    return questions

@app.route("/usage_stats", methods=["GET"])
def get_usage_stats():
    """Endpoint to check current usage and budget status"""
    return jsonify({
        "daily_usage": {
            "tokens": daily_usage["tokens"],
            "cost": f"${daily_usage['cost']:.2f}",
            "date": daily_usage["date"].isoformat()
        },
        "daily_budget": f"${DAILY_BUDGET:.2f}",
        "budget_remaining": f"${DAILY_BUDGET - daily_usage['cost']:.2f}",
        "budget_used_percent": f"{(daily_usage['cost'] / DAILY_BUDGET) * 100:.1f}%"
    })

@app.route("/text-to-speech", methods=["POST"])
def text_to_speech():
    try:
        data = request.json
        text_to_speak = data.get("text", "").strip()

        if not text_to_speak:
            return jsonify({"error": "No text provided"}), 400

        print(f"Converting to speech: {text_to_speak[:50]}...")

        # Initialize Deepgram client
        options = SpeakOptions(
            model="aura-asteria-en",
        )

        # Generate audio stream
        response = dg_client.speak.rest.v("1").stream(
            {"text": text_to_speak},
            options
        )

        print("✅ Text-to-speech successful")

        # Stream the audio directly to the client
        return Response(
            response.stream,
            mimetype="audio/mpeg",
            headers={
                "Content-Disposition": "inline",
                "Cache-Control": "no-cache"
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

                # Store response data (using multiple storage methods for redundancy)
                if not hasattr(app, 'all_responses'):
                    app.all_responses = {}

                if session_id not in app.all_responses:
                    app.all_responses[session_id] = {}

                app.all_responses[session_id][question_number] = response_data

                # Try to store in session as backup
                try:
                    if 'responses' not in session:
                        session['responses'] = {}
                    session['responses'][question_number] = response_data
                    session.modified = True
                    print(f"✅ Response #{question_number} stored in session")
                except Exception as session_error:
                    print(f"⚠️ Session storage failed: {str(session_error)}")

                # Keep RESPONSES_STORE for backward compatibility
                if session_id not in RESPONSES_STORE:
                    RESPONSES_STORE[session_id] = {}
                RESPONSES_STORE[session_id][question_key] = response_data

                # Count completed questions
                questions_completed = len(app.all_responses.get(session_id, {}))
                all_completed = questions_completed >= 5

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
                "file_path": file_path
            }), 500

    except Exception as e:
        print(f"❌ Error in save_and_transcribe: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/get-all-responses/<session_id>", methods=["GET"])
def get_all_responses(session_id):
    try:
        if hasattr(app, 'all_responses') and session_id in app.all_responses:
            responses = app.all_responses[session_id]
        elif session_id in RESPONSES_STORE:
            responses = RESPONSES_STORE[session_id]
        else:
            responses = {}

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

@app.route("/results/<session_id>")
def display_results(session_id):
    try:
        if hasattr(app, 'all_responses') and session_id in app.all_responses:
            responses = app.all_responses[session_id]
        elif session_id in RESPONSES_STORE:
            responses = RESPONSES_STORE[session_id]
        else:
            responses = {}

        has_all_responses = len(responses) >= 5

        if not has_all_responses:
            flash("Please complete all questions before viewing results.")
            return redirect(url_for('questions_page'))

        # Sort responses by question number
        sorted_responses = []
        for i in range(1, 6):  # Assuming 5 questions numbered 1-5
            if str(i) in responses:
                sorted_responses.append(responses[str(i)])

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
    print(f"📊 Daily budget set to: ${DAILY_BUDGET}")
    print(f"⏱️ Rate limit: {MAX_REQUESTS_PER_HOUR} requests per hour per user")
    print(f"🤖 Primary provider: Google Gemini")
    print(f"🔄 Fallback provider: {'OpenAI' if OPENAI_FALLBACK else 'None'}")
    
    app.run(debug=True)