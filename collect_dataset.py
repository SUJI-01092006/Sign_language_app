import cv2
import mediapipe as mp
import csv
import os
import numpy as np

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

def collect_dataset():
    """Collect hand gesture dataset with MediaPipe landmarks"""
    
    # Create dataset directory
    os.makedirs('gesture_dataset', exist_ok=True)
    csv_file = 'gesture_dataset/hand_landmarks.csv'
    
    # Load reference HELP image
    reference_img = None
    if os.path.exists('cnn.png'):
        reference_img = cv2.imread('cnn.png')
        reference_img = cv2.resize(reference_img, (300, 300))
    
    # Initialize CSV
    if not os.path.exists(csv_file):
        with open(csv_file, 'w', newline='') as f:
            writer = csv.writer(f)
            header = ['label'] + [f'{axis}{i}' for i in range(21) for axis in ['x', 'y', 'z']]
            writer.writerow(header)
    
    # Initialize MediaPipe Hand Landmarker
    options = HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path='hand_landmarker.task'),
        running_mode=VisionRunningMode.VIDEO,
        num_hands=1
    )
    
    print("\n=== HELP GESTURE DATASET COLLECTION ===")
    print("IMPORTANT: Match the HELP sign shown in the reference image!")
    print("\nPress keys to collect data:")
    print("  'h' - Collect HELP gesture (match reference image)")
    print("  'n' - Collect NO gesture (any other gesture)")
    print("  'q' - Quit")
    print("\nCollect 100+ samples for HELP matching the reference image")
    print("Collect 100+ samples for NO (random gestures)\n")
    
    cap = cv2.VideoCapture(0)
    frame_count = 0
    
    with HandLandmarker.create_from_options(options) as landmarker:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            frame = cv2.flip(frame, 1)
            frame_count += 1
            
            # Convert to MediaPipe Image
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame)
            
            # Detect hands
            detection_result = landmarker.detect_for_video(mp_image, frame_count)
            
            # Show reference image
            if reference_img is not None:
                frame[10:310, 10:310] = reference_img
                cv2.putText(frame, "HELP Reference", (15, 330), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            
            if detection_result.hand_landmarks:
                for hand_landmarks in detection_result.hand_landmarks:
                    # Draw landmarks
                    for idx, landmark in enumerate(hand_landmarks):
                        h, w, c = frame.shape
                        cx, cy = int(landmark.x * w), int(landmark.y * h)
                        cv2.circle(frame, (cx, cy), 5, (0, 255, 0), -1)
                    
                    # Extract landmarks
                    landmarks = []
                    for lm in hand_landmarks:
                        landmarks.extend([lm.x, lm.y, lm.z])
                    
                    # Display instructions
                    cv2.putText(frame, "Press 'h' for HELP (match image), 'n' for NO, 'q' to quit", 
                               (320, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                    
                    key = cv2.waitKey(1) & 0xFF
                    
                    if key == ord('h'):
                        with open(csv_file, 'a', newline='') as f:
                            writer = csv.writer(f)
                            writer.writerow(['HELP'] + landmarks)
                        print("HELP gesture saved (match reference!)")
                        cv2.putText(frame, "HELP SAVED!", (320, 70), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    
                    elif key == ord('n'):
                        with open(csv_file, 'a', newline='') as f:
                            writer = csv.writer(f)
                            writer.writerow(['NO'] + landmarks)
                        print("NO gesture saved")
                        cv2.putText(frame, "NO SAVED!", (320, 70), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    
                    elif key == ord('q'):
                        cap.release()
                        cv2.destroyAllWindows()
                        print(f"\nDataset saved to: {csv_file}")
                        print("\nNext step: python train_model.py")
                        return
            else:
                cv2.putText(frame, "No hand detected", (320, 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            
            cv2.imshow('Collect Dataset - Match HELP Reference Image', frame)
    
    cap.release()
    cv2.destroyAllWindows()
    print(f"\nDataset saved to: {csv_file}")
    print("\nNext step: python train_model.py")

if __name__ == "__main__":
    collect_dataset()
