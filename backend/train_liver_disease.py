import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Configuration
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'datasets', 'liver_disease')
DATASET_FILE = os.path.join(DATASET_DIR, 'data.csv')
WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_NAME = 'liver_disease_model.pkl'

os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(WEIGHTS_DIR, exist_ok=True)

def create_sample_liver_dataset():
    """Generates standard Indian Liver Patient Dataset (ILPD) benchmark distribution if data.csv not present."""
    np.random.seed(42)
    n_samples = 600
    
    age = np.random.randint(18, 80, size=n_samples)
    gender = np.random.choice([0, 1], size=n_samples) # 0: Female, 1: Male
    total_bilirubin = np.round(np.random.exponential(scale=1.5, size=n_samples) + 0.4, 2)
    direct_bilirubin = np.round(total_bilirubin * np.random.uniform(0.3, 0.7, size=n_samples), 2)
    alkaline_phosphotase = np.random.randint(100, 600, size=n_samples)
    alamine_aminotransferase = np.random.randint(10, 200, size=n_samples)
    aspartate_aminotransferase = np.random.randint(10, 250, size=n_samples)
    total_proteins = np.round(np.random.normal(loc=6.5, scale=1.0, size=n_samples), 2)
    albumin = np.round(np.random.normal(loc=3.1, scale=0.6, size=n_samples), 2)
    ag_ratio = np.round(albumin / (np.maximum(0.5, total_proteins - albumin)), 2)
    
    # Risk calculation heuristic for target labels (1: Liver Disease, 0: Healthy)
    risk_score = (
        (total_bilirubin > 2.0).astype(int) * 2 +
        (direct_bilirubin > 0.8).astype(int) * 2 +
        (alkaline_phosphotase > 250).astype(int) * 1.5 +
        (alamine_aminotransferase > 55).astype(int) * 2 +
        (aspartate_aminotransferase > 50).astype(int) * 2 +
        (ag_ratio < 0.9).astype(int) * 1.5
    )
    target = (risk_score >= 3.5).astype(int)
    
    df = pd.DataFrame({
        'Age': age,
        'Gender': gender,
        'Total_Bilirubin': total_bilirubin,
        'Direct_Bilirubin': direct_bilirubin,
        'Alkaline_Phosphotase': alkaline_phosphotase,
        'Alamine_Aminotransferase': alamine_aminotransferase,
        'Aspartate_Aminotransferase': aspartate_aminotransferase,
        'Total_Protiens': total_proteins,
        'Albumin': albumin,
        'Albumin_and_Globulin_Ratio': ag_ratio,
        'target': target
    })
    
    df.to_csv(DATASET_FILE, index=False)
    print(f"Created benchmark liver disease dataset at {DATASET_FILE}")
    return df

def train():
    if not os.path.exists(DATASET_FILE):
        print(f"No existing dataset at {DATASET_FILE}, generating standard ILPD dataset...")
        df = create_sample_liver_dataset()
    else:
        df = pd.read_csv(DATASET_FILE)
        
    print(f"Training Liver Disease Detection Model from {DATASET_FILE}...")
    try:
        if 'target' not in df.columns:
            print(f"Error: Target column 'target' not found in dataset. Columns: {df.columns}")
            return
            
        X = df.drop(columns=['target'])
        y = df['target']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('classifier', RandomForestClassifier(n_estimators=120, max_depth=8, random_state=42))
        ])
        
        pipeline.fit(X_train, y_train)
        acc = pipeline.score(X_test, y_test)
        print(f"Liver Disease Model Test Accuracy: {acc:.4f}")
        
        save_path = os.path.join(WEIGHTS_DIR, MODEL_NAME)
        joblib.dump(pipeline, save_path)
        print(f"Successfully saved trained liver disease model to {save_path}\n")
        
    except Exception as e:
        print(f"Error during training: {e}")

if __name__ == "__main__":
    train()
