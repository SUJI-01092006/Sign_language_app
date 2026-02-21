import whisper
import spacy
import sounddevice as sd
from scipy.io.wavfile import write
import numpy as np
import time
import os
import subprocess

# ==========================================
# LOAD MODELS
# ==========================================

print("Loading Whisper model...")
model = whisper.load_model("base")   # change to "large" later if needed

print("Loading spaCy model...")
nlp = spacy.load("en_core_web_sm")


# ==========================================
# SIGN GRAMMAR CONVERSION
# ==========================================

def convert_to_sign(text):
    doc = nlp(text)
    words = []

    for token in doc:

        # Skip punctuation
        if token.is_punct:
            continue

        # Remove helper grammar words
        if token.pos_ not in ["AUX", "DET", "ADP"]:
            if token.pos_ == "VERB":
                words.append(token.lemma_.upper())
            else:
                words.append(token.text.upper())

    return " ".join(words)


# ==========================================
# DISPLAY SIGN WORDS ONE BY ONE
# ==========================================

def display_sign_words(sign_text):
    print("\nDisplaying Sign Words:\n")

    words = sign_text.split()

    for word in words:
        print("👉", word)
        time.sleep(1)


# ==========================================
# PLAY SIGN VIDEOS
# Requires: sign_videos folder
# Example: SHE.mp4, GO.mp4, SCHOOL.mp4
# ==========================================

def play_sign_videos(sign_text):
    words = sign_text.split()

    print("\n🎬 Playing Sign Videos...\n")

    for word in words:
        video_path = os.path.join("sign_videos", f"{word}.mp4")

        if os.path.isfile(video_path):
            print(f"▶ Playing: {word}")

            subprocess.run(
                ["ffplay", "-autoexit", "-loglevel", "quiet", video_path]
            )
        else:
            print(f"⚠ No video found for {word}")


# ==========================================
# SHOW AVAILABLE MICROPHONES
# ==========================================

print("\nAvailable Microphones:")
print(sd.query_devices())

# Set your correct mic index (yours was 1)
sd.default.device = 1


# ==========================================
# RECORD AUDIO
# ==========================================

duration = 5        # seconds
fs = 16000          # Whisper preferred sample rate

try:
    print("\nSpeak now...")

    recording = sd.rec(
        int(duration * fs),
        samplerate=fs,
        channels=1,
        dtype='float32'
    )

    sd.wait()

    # Normalize audio
    if np.max(np.abs(recording)) != 0:
        recording = recording / np.max(np.abs(recording))

    write("input.wav", fs, recording)
    print("Recording saved.")

except Exception as e:
    print("❌ Recording error:", e)
    exit()


# ==========================================
# TRANSCRIBE AUDIO
# ==========================================

print("\nTranscribing...")

try:
    result = model.transcribe("input.wav")

    original_text = result.get("text", "").strip()

    if original_text == "":
        print("❌ No speech detected!")
    else:
        sign_text = convert_to_sign(original_text)

        print("\n✅ Original:", original_text)
        print("🤟 Sign Version:", sign_text)

        # Show words one by one
        display_sign_words(sign_text)

        # Play sign animation videos
        if os.path.exists("sign_videos"):
            play_sign_videos(sign_text)
        else:
            print("⚠ sign_videos folder not found!")

except Exception as e:
    print("❌ Transcription error:", e)
