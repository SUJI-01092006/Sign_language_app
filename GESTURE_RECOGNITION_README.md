# AI-Powered HELP Gesture Recognition System

## Overview
Real-time hand gesture recognition using MediaPipe and Machine Learning to detect "HELP" sign and trigger emergency alerts.

## Features
- ✅ MediaPipe Hands: 21 landmark extraction (x, y, z coordinates)
- ✅ Random Forest Classifier: High accuracy, low latency
- ✅ 2-Second Continuous Detection: Prevents false positives
- ✅ Auto SMS Alert: Sends location to parent (6374145856)
- ✅ Dataset Collection Tool: Easy training data capture
- ✅ Real-time Prediction: 30 FPS processing

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Collect Dataset (50+ samples per class)
```bash
python collect_dataset.py
```
**Instructions:**
- Press 'h' to capture HELP gesture (collect 50-100 samples)
- Press 'n' to capture NO gesture / other gestures (collect 50-100 samples)
- Press 'q' to quit

**Tips:**
- Vary hand positions, angles, distances
- Use different lighting conditions
- Include slight variations of the gesture

### 3. Train Model
```bash
python train_model.py
```
**Output:**
- Model accuracy report
- Confusion matrix
- Saved model: `gesture_dataset/help_gesture_model.pkl`

### 4. Test Real-time Prediction (Standalone)
```bash
python predict_realtime.py
```
- Show HELP gesture continuously for 2 seconds
- Alert triggers when 80% of frames (48/60) detect HELP

### 5. Run Flask App
```bash
python app.py
```
- Navigate to: http://localhost:5000/alert
- Click "Start Detection"
- Show HELP gesture for 2 seconds
- SMS alert sent automatically to 6374145856

## How It Works

### 1. Landmark Extraction
MediaPipe extracts 21 hand landmarks:
- Wrist (0)
- Thumb (1-4)
- Index (5-8)
- Middle (9-12)
- Ring (13-16)
- Pinky (17-20)

Each landmark has x, y, z coordinates = 63 features total

### 2. Classification
Random Forest Classifier:
- 100 trees
- Max depth: 10
- Features: 63 (21 landmarks × 3 coordinates)
- Classes: HELP, NO

### 3. Continuous Detection
- Buffer: 60 frames (2 seconds at 30 FPS)
- Threshold: 80% HELP detection (48/60 frames)
- Cooldown: 5 seconds between alerts

### 4. Alert Trigger
When HELP detected for 2 seconds:
1. Capture GPS location
2. Send SMS to parent: "EMERGENCY ALERT: [Name] detected 'Help' sign. Location: [Google Maps Link]"
3. Save to database (if logged in)
4. Show visual alert on screen

## Model Performance

### Expected Accuracy
- Training: 95-98%
- Testing: 90-95%
- Real-time: 85-90%

### Optimization Tips
1. **More Data**: Collect 100+ samples per class
2. **Balanced Dataset**: Equal samples for each class
3. **Feature Engineering**: Add hand orientation, velocity
4. **Model Tuning**: Adjust n_estimators, max_depth
5. **Ensemble**: Combine Random Forest + Neural Network

## File Structure
```
demo model ai/
├── collect_dataset.py       # Dataset collection tool
├── train_model.py           # Model training script
├── predict_realtime.py      # Standalone prediction
├── gesture_service.py       # Flask integration service
├── app.py                   # Flask app with /predict_gesture endpoint
├── templates/
│   └── alert_ml.html        # ML-powered alert page
└── gesture_dataset/
    ├── hand_landmarks.csv   # Training data
    └── help_gesture_model.pkl  # Trained model
```

## API Endpoint

### POST /predict_gesture
**Request:**
```json
{
  "landmarks": [
    {"x": 0.5, "y": 0.5, "z": 0.0},
    ...  // 21 landmarks
  ],
  "latitude": 12.345,
  "longitude": 67.890
}
```

**Response:**
```json
{
  "gesture": "HELP",
  "confidence": 0.95,
  "alert": true,
  "buffer_percentage": 85.0
}
```

## Troubleshooting

### Low Accuracy
- Collect more diverse training data
- Ensure good lighting during collection
- Vary hand positions and angles

### False Positives
- Increase detection threshold (80% → 90%)
- Add more "NO" gesture samples
- Increase buffer size (60 → 90 frames)

### High Latency
- Reduce MediaPipe model complexity
- Use fewer trees in Random Forest
- Optimize frame processing rate

## SMS Configuration

Edit `sms_service.py` to enable actual SMS:
- **Fast2SMS** (India): Add API key
- **Twilio** (Global): Add credentials
- **MSG91** (India): Add API key

## Future Enhancements
- [ ] Deep Learning (LSTM for temporal patterns)
- [ ] Multi-gesture support (HELP, EMERGENCY, POLICE)
- [ ] Mobile app integration
- [ ] Cloud deployment
- [ ] Voice alert option
