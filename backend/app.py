from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
from google.cloud import texttospeech

dotenv_path = "/Users/chelsn/WebstormProjects/WiNG-it/.env.local"
load_dotenv(dotenv_path)

# Ensure API key is loaded
openai.api_key = os.getenv('OPENAI_API_KEY')
if not openai.api_key:
    raise ValueError("❌ OPENAI_API_KEY is not set. Check your .env file and path.")

# For frontend req
app = Flask(__name__)
CORS(app)

# Initialize Google TTS client
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "../config/mercurial-idiom-451220-i3-8d9d8d543f60.json"
tts_client = texttospeech.TextToSpeechClient()

@app.route("/generate_questions", methods=["POST"])
def generate_questions():
    try:
        data = request.json
        job_role = data.get("job_role", "").strip()

        if not job_role:
            prompt = "Generate 5 common behavioral interview questions."
        else:
            prompt = f"Generate 5 behavioral interview questions for a {job_role} role."

        response = openai.chat.completions.create(
            # https://platform.openai.com/settings/organization/limits
            model="gpt-4o-mini",
            # Define the prompt
            messages=[{"role": "user", "content": prompt}]
        )

        # Extracting the generated text
        questions = response.choices[0].message.content.split("\n")
        return jsonify({"questions": questions})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/text-to-speech", methods=["POST"])
def text_to_speech():
    try:
        data = request.json
        text = data.get("text", "").strip()

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Set the text input to be synthesized
        synthesis_input = texttospeech.SynthesisInput(text=text)

        # Sets type of voice and language settings
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Standard-G",
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        response = tts_client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        # Return the audio content as a response
        return response.audio_content, 200, {'Content-Type': 'audio/mpeg'}

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)