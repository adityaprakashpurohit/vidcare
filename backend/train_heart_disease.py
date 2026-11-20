import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Configuration
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'datasets', 'heart_disease')
DATASET_FILE = os.path.join(DATASET_DIR, 'data.csv')
WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_NAME = 'heart_disease_model.pkl'

os.makedirs(WEIGHTS_DIR, exist_ok=True)

def train():
    if not os.path.exists(DATASET_FILE):
        print(f"ERROR: No dataset found at {DATASET_FILE}")
        print("Please place your physical 'data.csv' file in that directory.")
        return
        
    print(f"Training Heart Disease Model from {DATASET_FILE}...")
    try:
        df = pd.read_csv(DATASET_FILE)
        
        # Assuming 'target' is the column name for predictions
        if 'target' not in df.columns:
            print(f"Error: Target column 'target' not found. Found columns: {df.columns}")
            return
            
        X = df.drop(columns=['target'])
        y = df['target']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Build Pipeline with scaling
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
        ])
        
        pipeline.fit(X_train, y_train)
        acc = pipeline.score(X_test, y_test)
        print(f"Heart Disease Model Accuracy: {acc:.4f}")
        
        save_path = os.path.join(WEIGHTS_DIR, MODEL_NAME)
        joblib.dump(pipeline, save_path)
        print(f"Saved trained weights to {save_path}\n")
        
    except Exception as e:
        print(f"Error during training: {e}")

if __name__ == "__main__":
    train()
