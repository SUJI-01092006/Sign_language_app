"""
Quick Start Script for HELP Gesture Recognition System
Run this to see the complete workflow
"""

import os
import sys

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def main():
    print_header("HELP GESTURE RECOGNITION SYSTEM - QUICK START")
    
    print("This system uses MediaPipe + Machine Learning to detect HELP gestures")
    print("and automatically send SMS alerts with live location.\n")
    
    print("WORKFLOW:")
    print("1. Collect Dataset (50+ samples per class)")
    print("2. Train Model (Random Forest Classifier)")
    print("3. Real-time Prediction (2-second continuous detection)")
    print("4. Auto Alert (SMS to 6374145856 with GPS location)\n")
    
    # Check if model exists
    model_exists = os.path.exists('gesture_dataset/help_gesture_model.pkl')
    dataset_exists = os.path.exists('gesture_dataset/hand_landmarks.csv')
    
    if not dataset_exists:
        print("WARNING: Dataset not found!")
        print("   Run: python collect_dataset.py")
        print("   Collect 50+ samples for HELP and NO gestures\n")
    else:
        print("OK: Dataset found\n")
    
    if not model_exists:
        print("WARNING: Model not found!")
        print("   Run: python train_model.py")
        print("   Train the classifier on your dataset\n")
    else:
        print("OK: Model found\n")
    
    if model_exists and dataset_exists:
        print("OK: System ready!")
        print("\nOPTIONS:")
        print("1. Test standalone: python predict_realtime.py")
        print("2. Run Flask app: python app.py")
        print("   Then visit: http://localhost:5000/alert\n")
    
    print_header("NEXT STEPS")
    
    if not dataset_exists:
        print("Step 1: python collect_dataset.py")
        print("  - Press 'h' for HELP gesture (50+ times)")
        print("  - Press 'n' for NO gesture (50+ times)")
        print("  - Press 'q' to quit\n")
    elif not model_exists:
        print("Step 2: python train_model.py")
        print("  - Trains Random Forest on your dataset")
        print("  - Shows accuracy and saves model\n")
    else:
        print("Step 3: python predict_realtime.py")
        print("  - Real-time gesture detection")
        print("  - Hold HELP for 2 seconds to trigger alert\n")
        print("OR")
        print("\nStep 4: python app.py")
        print("  - Full web interface at http://localhost:5000/alert")
        print("  - SMS alerts to 6374145856 with location\n")

if __name__ == "__main__":
    main()
