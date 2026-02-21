# Alert System Setup

## 1. Prepare Training Data

Create folder structure:
```
cnn_images/
  help/          (Put help gesture images here)
  not_help/      (Put normal/other gesture images here)
```

Add at least 50-100 images in each folder.

## 2. Train the Model

```bash
pip install tensorflow opencv-python numpy
python train_help_model.py
```

This creates `models/help_gesture_model.h5`

## 3. Run the Application

```bash
python app.py
```

## 4. Access Alert System

Navigate to: http://localhost:5000/alert

## Features

- Real-time webcam monitoring
- CNN-based help gesture detection
- Automatic location tracking
- SMS alert to parent with location
- Parent notification in dashboard

## How It Works

1. Student opens alert page
2. Clicks "Start Monitoring"
3. System captures webcam frames every second
4. CNN model detects help gesture
5. If detected (>70% confidence):
   - Gets current GPS location
   - Sends SMS to parent phone
   - Creates alert in database
   - Notifies parent dashboard
