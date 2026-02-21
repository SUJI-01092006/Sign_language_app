import cv2
import mediapipe as mp
import numpy as np
import joblib
import os
import time
from collections import deque

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

def predict_realtime():
    """Real-time hand gesture prediction with 2-second continuous detection"""
    
    model_path = 'gesture_dataset/help_gesture_model.pkl'
    
    if not os.path.exists(model_path):
        print("Error: Model not found. Run train_model.py first.")
        return
    
    # Load model
    clf = joblib.load(model_path)
    print("Model loaded successfully")
    
    cap = cv2.VideoCapture(0)
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7
    )
    
    # Prediction buffer for 2-second continuous detection
    prediction_buffer = deque(maxlen=60)  # 60 frames = 2 seconds at 30fps
    help_detected_time = None
    alert_triggered = False
    
    print("\n=== REAL-TIME GESTURE RECOGNITION ===")
    print("Show HELP gesture continuously for 2 seconds to trigger alert")
    print("Press 'q' to quit\n")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)
        
        current_prediction = "NO"
        confidence = 0.0
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_drawing.draw_landmarks(
                    frame, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                    mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)
                )
                
                # Extract landmarks
                landmarks = []
                for lm in hand_landmarks.landmark:
                    landmarks.extend([lm.x, lm.y, lm.z])
                
                # Predict
                prediction = clf.predict([landmarks])[0]
                proba = clf.predict_proba([landmarks])[0]
                confidence = max(proba)
                
                current_prediction = prediction
                prediction_buffer.append(prediction)
        else:
            prediction_buffer.append("NO")
        
        # Check for continuous HELP detection (2 seconds)
        if len(prediction_buffer) == 60:
            help_count = prediction_buffer.count("HELP")
            help_percentage = (help_count / 60) * 100
            
            if help_percentage >= 80:  # 80% of frames in 2 seconds
                if not alert_triggered:
                    alert_triggered = True
                    help_detected_time = time.time()
                    print("\n" + "="*60)
                    print("🚨 ALERT TRIGGERED! HELP gesture detected for 2 seconds!")
                    print("="*60 + "\n")
                    # Here you would call your SMS alert function
            else:
                alert_triggered = False
        
        # Display info
        color = (0, 255, 0) if current_prediction == "HELP" else (0, 0, 255)
        cv2.putText(frame, f"Gesture: {current_prediction}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
        cv2.putText(frame, f"Confidence: {confidence*100:.1f}%", (10, 70),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        # Show buffer status
        if len(prediction_buffer) > 0:
            help_count = prediction_buffer.count("HELP")
            buffer_percentage = (help_count / len(prediction_buffer)) * 100
            cv2.putText(frame, f"HELP Buffer: {buffer_percentage:.0f}%", (10, 110),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
        
        # Alert status
        if alert_triggered:
            cv2.putText(frame, "ALERT ACTIVE!", (10, 150),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
        
        cv2.imshow('Real-time Gesture Recognition', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    hands.close()

if __name__ == "__main__":
    predict_realtime()
