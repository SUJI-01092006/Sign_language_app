import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os

def train_model():
    """Train Random Forest classifier on hand gesture dataset"""
    
    csv_file = 'gesture_dataset/hand_landmarks.csv'
    
    if not os.path.exists(csv_file):
        print("Error: Dataset not found. Run collect_dataset.py first.")
        return
    
    # Load dataset
    df = pd.read_csv(csv_file)
    print(f"\nDataset loaded: {len(df)} samples")
    print(f"Classes: {df['label'].value_counts().to_dict()}")
    
    if len(df) < 20:
        print("\nWarning: Dataset too small. Collect at least 50 samples per class.")
        return
    
    # Prepare data
    X = df.drop('label', axis=1).values
    y = df['label'].values
    
    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining samples: {len(X_train)}")
    print(f"Testing samples: {len(X_test)}")
    
    # Train Random Forest
    print("\nTraining Random Forest Classifier...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)
    
    # Evaluate
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n{'='*50}")
    print(f"Model Accuracy: {accuracy*100:.2f}%")
    print(f"{'='*50}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Save model
    model_path = 'gesture_dataset/help_gesture_model.pkl'
    joblib.dump(clf, model_path)
    print(f"\nModel saved to: {model_path}")
    
    # Feature importance
    feature_importance = clf.feature_importances_
    top_features = np.argsort(feature_importance)[-10:]
    print(f"\nTop 10 important features: {top_features}")

if __name__ == "__main__":
    train_model()
