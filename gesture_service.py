import numpy as np
import joblib
import os
from collections import deque
import time

class GestureRecognizer:
    def __init__(self, model_path='gesture_dataset/help_gesture_model.pkl'):
        self.model = None
        self.prediction_buffer = deque(maxlen=60)  # 2 seconds at 30fps
        self.alert_triggered = False
        self.last_alert_time = 0
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            print(f"Gesture model loaded from {model_path}")
        else:
            print(f"Warning: Model not found at {model_path}")
    
    def predict(self, landmarks):
        """Predict gesture from hand landmarks"""
        if self.model is None:
            return {"gesture": "NO", "confidence": 0.0, "alert": False}
        
        # Flatten landmarks
        features = []
        for lm in landmarks:
            features.extend([lm['x'], lm['y'], lm['z']])
        
        # Predict
        prediction = self.model.predict([features])[0]
        proba = self.model.predict_proba([features])[0]
        confidence = max(proba)
        
        # Add to buffer
        self.prediction_buffer.append(prediction)
        
        # Check for continuous HELP detection
        alert = False
        if len(self.prediction_buffer) == 60:
            help_count = self.prediction_buffer.count("HELP")
            help_percentage = (help_count / 60) * 100
            
            if help_percentage >= 80:  # 80% of frames in 2 seconds
                current_time = time.time()
                if current_time - self.last_alert_time > 5:  # Cooldown 5 seconds
                    alert = True
                    self.alert_triggered = True
                    self.last_alert_time = current_time
        
        return {
            "gesture": prediction,
            "confidence": float(confidence),
            "alert": alert,
            "buffer_percentage": (self.prediction_buffer.count("HELP") / len(self.prediction_buffer) * 100) if len(self.prediction_buffer) > 0 else 0
        }
    
    def reset(self):
        """Reset prediction buffer"""
        self.prediction_buffer.clear()
        self.alert_triggered = False

# Global instance
gesture_recognizer = GestureRecognizer()
