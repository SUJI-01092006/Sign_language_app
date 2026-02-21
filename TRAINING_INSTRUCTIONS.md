# HELP Sign Recognition - Training Instructions

## Reference Image
The system will ONLY recognize the HELP sign shown in `cnn.png`

## Step-by-Step Training

### 1. Collect Dataset (CRITICAL: Match the Reference Image!)
```bash
python collect_dataset.py
```

**IMPORTANT:**
- The reference HELP image will be shown in the top-left corner
- When pressing 'h', make EXACTLY the same hand gesture as shown in the reference
- Collect 100+ samples of the HELP gesture matching the reference
- Vary: distance, angle, lighting, but keep the hand shape SAME
- For 'n' (NO class): Make any OTHER gesture (random hand positions)

**Tips for HELP gesture:**
- Match finger positions exactly as shown in cnn.png
- Keep hand orientation similar
- Collect from different angles but same gesture
- Ensure good lighting

**Tips for NO gesture:**
- Random hand positions
- Different finger configurations
- Closed fist, peace sign, thumbs up, etc.
- Any gesture that is NOT the HELP sign

### 2. Train Model
```bash
python train_model.py
```

This will:
- Train Random Forest on your specific HELP gesture
- Show accuracy (aim for 90%+)
- Save model to `gesture_dataset/help_gesture_model.pkl`

### 3. Test Real-time
```bash
python predict_realtime.py
```

- Show the HELP gesture (matching cnn.png)
- Hold for 2 seconds
- Alert should trigger ONLY for the correct HELP sign

### 4. Run Web App
```bash
python app.py
```

Visit: http://localhost:5000/alert

- Reference image shown on page
- Make the HELP gesture matching the reference
- Hold for 2 seconds
- SMS sent to 6374145856 with GPS location

## Verification

### The system should:
✅ Detect HELP ONLY when you show the exact gesture from cnn.png
✅ Show "NO" for any other hand gesture
✅ Require 2 seconds continuous detection (80% of 60 frames)
✅ Send SMS alert ONLY when HELP is confirmed

### The system should NOT:
❌ Trigger on random hand movements
❌ Trigger on other gestures
❌ Trigger on partial/incorrect HELP signs
❌ Trigger immediately (needs 2 seconds)

## Troubleshooting

### If detecting wrong gestures as HELP:
1. Collect more NO samples (100+)
2. Include similar-looking gestures in NO class
3. Increase detection threshold (80% → 90%)

### If NOT detecting correct HELP:
1. Collect more HELP samples (100+)
2. Ensure samples match reference image exactly
3. Check lighting and hand visibility
4. Reduce detection threshold (80% → 70%)

### If too many false positives:
1. Add more diverse NO samples
2. Increase buffer size (60 → 90 frames = 3 seconds)
3. Increase threshold (80% → 90%)

## Dataset Quality Checklist

Before training, ensure:
- [ ] 100+ HELP samples matching cnn.png exactly
- [ ] 100+ NO samples with diverse gestures
- [ ] Good lighting in all samples
- [ ] Hand clearly visible in all samples
- [ ] Varied distances and angles
- [ ] No duplicate/similar frames

## Expected Results

With good dataset:
- Training Accuracy: 95-98%
- Testing Accuracy: 90-95%
- Real-time Accuracy: 85-90%
- False Positive Rate: <5%
- Detection Latency: <100ms

## SMS Alert

When HELP detected for 2 seconds:
```
SMS to: 6374145856
Message: EMERGENCY ALERT: [Name] detected 'Help' sign. 
Location: https://www.google.com/maps?q=[lat],[lng]
```

## Ready to Start!

1. Run: `python collect_dataset.py`
2. Match the reference image shown
3. Collect 100+ HELP, 100+ NO samples
4. Train and test!
