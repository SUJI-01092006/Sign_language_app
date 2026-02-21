import os
import sys

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Test if video files exist
video_path = os.path.join('learning', 'Animation_video')
print(f"Checking path: {os.path.abspath(video_path)}")
print(f"Path exists: {os.path.exists(video_path)}")

if os.path.exists(video_path):
    videos = [f for f in os.listdir(video_path) if f.endswith('.mp4')]
    print(f"\nFound {len(videos)} videos:")
    
    # Test alphabets
    alphabets = [chr(i) for i in range(ord('A'), ord('Z')+1)]
    print("\nAlphabets available:")
    for letter in alphabets:
        if f"{letter}.mp4" in videos:
            print(f"[OK] {letter}")
        else:
            print(f"[MISSING] {letter}")
    
    # Test numbers
    print("\nNumbers available:")
    for num in range(10):
        if f"{num}.mp4" in videos:
            print(f"[OK] {num}")
        else:
            print(f"[MISSING] {num}")
else:
    print("ERROR: Video path does not exist!")
