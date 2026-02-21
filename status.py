import os

print("\n" + "="*70)
print("  PROBLEM: Showing 'HELP' for any gesture")
print("="*70)
print("\nREASON: Model is NOT trained yet!")
print("\nSOLUTION: Follow these 3 steps:\n")

print("STEP 1: Collect Dataset")
print("-" * 70)
print("Command: python collect_dataset.py")
print("\n1. Reference image (cnn.png) will show on screen")
print("2. Make EXACT same gesture as cnn.png")
print("3. Press 'h' 100+ times (for HELP gesture)")
print("4. Make different gestures (NOT the HELP sign)")
print("5. Press 'n' 100+ times (for NO/other gestures)")
print("6. Press 'q' to quit\n")

print("STEP 2: Train Model")
print("-" * 70)
print("Command: python train_model.py")
print("\nThis teaches the system what HELP looks like\n")

print("STEP 3: Use System")
print("-" * 70)
print("Command: python app.py")
print("Visit: http://localhost:5000/alert")
print("\nNow it will ONLY detect the HELP sign from cnn.png!\n")

# Check status
dataset_exists = os.path.exists('gesture_dataset/hand_landmarks.csv')
model_exists = os.path.exists('gesture_dataset/help_gesture_model.pkl')

print("="*70)
print("  CURRENT STATUS")
print("="*70 + "\n")

if not dataset_exists:
    print("Dataset: NOT FOUND")
    print("Next: python collect_dataset.py\n")
elif not model_exists:
    print("Dataset: FOUND")
    print("Model: NOT TRAINED")
    print("Next: python train_model.py\n")
else:
    print("Dataset: FOUND")
    print("Model: TRAINED")
    print("Next: python app.py\n")
    print("System is ready!\n")
