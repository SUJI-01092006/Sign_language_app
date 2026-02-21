# MediaPipe Hand Gesture Alert System

## Step 1: Install Dependencies
```bash
pip install mediapipe scikit-learn pandas opencv-python
```

## Step 2: Collect Dataset
```bash
python collect_help_dataset.py
```
- Press 'h' when showing HELP gesture (collect 50+ samples)
- Press 'n' for other gestures (collect 50+ samples)
- Press 'q' to quit

## Step 3: Train Model
```bash
python train_gesture_model.py
```

## Step 4: Run Application
```bash
python app.py
```

## Step 5: Test Alert System
1. Go to: http://localhost:5000/alert
2. Click "Start Camera"
3. Show HELP gesture for 2 seconds
4. Alert sent to parent with GPS location

## Features
✅ Start/Stop camera controls
✅ MediaPipe 21-point hand landmark detection
✅ Random Forest classifier
✅ 2-second continuous detection
✅ GPS location tracking
✅ SMS alert to parent
