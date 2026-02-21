"""
CRITICAL: You MUST train the model first!

The system is showing "Help" for any gesture because there's NO trained model yet.

Follow these steps:
"""

import os

print("\n" + "="*70)
print("  WHY IT'S SHOWING 'HELP' FOR ANY GESTURE")
print("="*70)
print("\nThe model is NOT trained yet!")
print("Without training, the system has no way to know what HELP looks like.")
print("\nYou MUST complete these steps:\n")

print("="*70)
print("  STEP 1: COLLECT DATASET")
print("="*70)
print("\nRun this command:")
print("  python collect_dataset.py\n")
print("What to do:")
print("  1. The cnn.png reference image will show on screen")
print("  2. Make the EXACT same hand gesture as shown in cnn.png")
print("  3. Press 'h' key 100 times (while holding the HELP gesture)")
print("  4. Make different gestures (peace sign, fist, thumbs up, etc.)")
print("  5. Press 'n' key 100 times (for each different gesture)")
print("  6. Press 'q' to quit\n")

print("IMPORTANT:")
print("  - HELP gesture MUST match cnn.png exactly")
print("  - NO gestures should be anything EXCEPT the HELP sign")
print("  - Collect at least 100 samples for each\n")

print("="*70)
print("  STEP 2: TRAIN MODEL")
print("="*70)
print("\nRun this command:")
print("  python train_model.py\n")
print("This will:")
print("  - Learn what HELP looks like from your samples")
print("  - Learn what NO looks like from your samples")
print("  - Create the model file")
print("  - Show accuracy (should be 90%+)\n")

print("="*70)
print("  STEP 3: TEST")
print("="*70)
print("\nRun this command:")
print("  python app.py\n")
print("Then visit: http://localhost:5000/alert\n")
print("Now it will:")
print("  ✓ Show 'Help' ONLY for the gesture from cnn.png")
print("  ✓ Show 'NO' for any other gesture")
print("  ✓ Send SMS after 2 seconds of HELP\n")

# Check current status
dataset_exists = os.path.exists('gesture_dataset/hand_landmarks.csv')
model_exists = os.path.exists('gesture_dataset/help_gesture_model.pkl')

print("="*70)
print("  CURRENT STATUS")
print("="*70)

if not dataset_exists:
    print("\n❌ Dataset: NOT FOUND")
    print("   → Run: python collect_dataset.py\n")
else:
    # Count samples
    with open('gesture_dataset/hand_landmarks.csv', 'r') as f:
        lines = f.readlines()
        help_count = sum(1 for line in lines if line.startswith('HELP'))
        no_count = sum(1 for line in lines if line.startswith('NO'))
    
    print(f"\n✓ Dataset: FOUND")
    print(f"   HELP samples: {help_count}")
    print(f"   NO samples: {no_count}")
    
    if help_count < 50 or no_count < 50:
        print("\n   ⚠ WARNING: Need at least 50 samples each!")
        print("   → Run: python collect_dataset.py (collect more)\n")

if not model_exists:
    print("❌ Model: NOT TRAINED")
    if dataset_exists:
        print("   → Run: python train_model.py\n")
    else:
        print("   → First collect dataset, then train\n")
else:
    print("✓ Model: TRAINED")
    print("   → Ready to use!\n")

print("="*70)
print("  NEXT STEP")
print("="*70)

if not dataset_exists:
    print("\n👉 Run: python collect_dataset.py")
    print("   Collect 100+ HELP (matching cnn.png) and 100+ NO samples\n")
elif not model_exists:
    print("\n👉 Run: python train_model.py")
    print("   Train the model on your dataset\n")
else:
    print("\n👉 Run: python app.py")
    print("   Visit: http://localhost:5000/alert")
    print("   System is ready!\n")

print("="*70 + "\n")
