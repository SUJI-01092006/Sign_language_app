# Sign Language Converter Web App

## Features
✅ Record audio or upload audio files
✅ Automatic speech-to-sign conversion
✅ Continuous video playback (loops automatically)
✅ Upload new sign videos from web interface
✅ View all available sign videos

## Setup

1. Install dependencies:
```
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

2. Run the app:
```
python app.py
```

3. Open browser: http://localhost:5000

## Usage

1. **Record Audio**: Click "Start Recording" → speak → "Stop Recording"
2. **Upload Audio**: Choose audio file → click "Upload Audio"
3. **Add Videos**: Enter word → select video file → click "Upload Video"
4. Videos will play continuously in a loop automatically

## Folder Structure
- `sign_videos/` - Sign language video files (WORD.mp4)
- `audio_uploads/` - Temporary audio files
- `templates/` - HTML interface
