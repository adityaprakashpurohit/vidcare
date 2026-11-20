"""
Tabular healthcare models: one ML model + one DL model per disease.
Accuracy is printed while training.

Run:  python tabular_models.py heart
      python tabular_models.py liver
      python tabular_models.py breast
      python tabular_models.py disease

Put the downloaded CSV next to this file or inside data/ (breast needs no download).
"""
import json
import os
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

N_ROUNDS = 300  # XGBoost trees
BASE_DIR = Path(__file__).resolve().parent

def find_file(filename):
    if not filename:
        return None
    candidates = [
        BASE_DIR / "datasets" / filename,
        BASE_DIR / filename,
        BASE_DIR / "data" / filename,
        BASE_DIR.parent / "datasets" / filename,
        BASE_DIR.parent / filename,
        BASE_DIR.parent / "data" / filename,
        Path(filename)
    ]
    for c in candidates:
        if c.exists():
            return c
    return BASE_DIR / "datasets" / filename

CONFIG = {
    # Kaggle: fedesoriano/heart-failure-prediction  -> heart.csv
    "heart": dict(file="heart.csv", target="HeartDisease", ml="xgb",
                  classes=["No heart disease", "Heart disease"]),
    # Kaggle: uciml/indian-liver-patient-records -> indian_liver_patient.csv
    "liver": dict(file="indian_liver_patient.csv", target="Dataset", ml="xgb",
                  classes=["No liver disease", "Liver disease"]),
    # Built into scikit-learn (Wisconsin Diagnostic Breast Cancer), no file needed
    "breast": dict(file=None, target=None, ml="xgb", classes=["Malignant", "Benign"]),
    # Kaggle: kaushil268/disease-prediction-using-machine-learning -> Training.csv
    "disease": dict(file="Training.csv", target="prognosis", ml="rf", classes=None),
}


def load(name):
    cfg = CONFIG[name]
    if name == "breast":
        d = load_breast_cancer(as_frame=True)
        X = d.data
        schema = [dict(name=c, type="number", default=float(X[c].median())) for c in X.columns]
        return X, d.target.values, cfg["classes"], schema

    target_file = find_file(cfg["file"])
    if not target_file.exists():
        raise FileNotFoundError(f"File '{cfg['file']}' not found at {target_file}. "
                                f"Please place the CSV file in backend/ or data/.")

    df = pd.read_csv(target_file)
    df = df.loc[:, ~df.columns.str.startswith("Unnamed")]
    y = df.pop(cfg["target"])
    if name == "liver":                      # 1 = liver patient, 2 = healthy
        y = (y == 1).astype(int)
    schema = []                              # describes the input form shown in the web UI
    for c in df.columns:
        if not pd.api.types.is_numeric_dtype(df[c]):
            opts = sorted(df[c].dropna().unique().tolist())
            schema.append(dict(name=c, type="select", options=opts, default=df[c].mode()[0]))
        elif set(df[c].dropna().unique()) <= {0, 1}:
            schema.append(dict(name=c, type="binary", default=0))
        else:
            schema.append(dict(name=c, type="number", default=float(df[c].median())))
    X = pd.get_dummies(df, drop_first=True).astype(float)
    le = LabelEncoder().fit(y)
    classes = cfg["classes"] or [str(c) for c in le.classes_]
    return X, le.transform(y), classes, schema


def run(name):
    X, y, classes, schema = load(name)
    cfg = CONFIG[name]
    n_classes = len(np.unique(y))
    print(f"\n=== {name}: {X.shape[0]} rows, {X.shape[1]} features, {n_classes} classes ===")

    # train / validation / test split (test is never used for training)
    X_tmp, X_te, y_tmp, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    X_tr, X_val, y_tr, y_val = train_test_split(X_tmp, y_tmp, test_size=0.15, stratify=y_tmp, random_state=42)
    imp = SimpleImputer(strategy="median").fit(X_tr)
    X_tr, X_val, X_te = [imp.transform(a) for a in (X_tr, X_val, X_te)]

    # ---------------- ML model ----------------
    print("\n--- ML model ---")
    use_xgb = cfg["ml"] == "xgb" and HAS_XGB
    if use_xgb:
        metric = "error" if n_classes == 2 else "merror"
        ml = XGBClassifier(n_estimators=N_ROUNDS, learning_rate=0.05, max_depth=4,
                           subsample=0.8, colsample_bytree=0.8, eval_metric=metric)
        ml.fit(X_tr, y_tr, eval_set=[(X_tr, y_tr), (X_val, y_val)], verbose=False)
        res = ml.evals_result()
        for i in list(range(0, N_ROUNDS, 50)) + [N_ROUNDS - 1]:
            print(f"  round {i + 1:3d} | train acc {1 - res['validation_0'][metric][i]:.4f} "
                  f"| val acc {1 - res['validation_1'][metric][i]:.4f}")
    else:
        if cfg["ml"] == "xgb" and not HAS_XGB:
            print("  Note: xgboost not installed. Using RandomForestClassifier.")
        ml = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1).fit(X_tr, y_tr)
        print(f"  train acc {accuracy_score(y_tr, ml.predict(X_tr)):.4f} "
              f"| val acc {accuracy_score(y_val, ml.predict(X_val)):.4f}")
    ml_pred = ml.predict(X_te)
    ml_acc = accuracy_score(y_te, ml_pred)
    print(f"  ML TEST accuracy: {ml_acc:.4f}")
    print(classification_report(y_te, ml_pred, zero_division=0))

    # ---------------- DL model ----------------
    print("\n--- DL model (accuracy / val_accuracy printed every epoch) ---")
    sc = StandardScaler().fit(X_tr)
    A, B, C = sc.transform(X_tr), sc.transform(X_val), sc.transform(X_te)
    binary = n_classes == 2
    dl = tf.keras.Sequential([
        tf.keras.Input(shape=(A.shape[1],)),
        tf.keras.layers.Dense(128, activation="relu"),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation="relu"),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(1 if binary else n_classes,
                              activation="sigmoid" if binary else "softmax"),
    ])
    dl.compile(optimizer="adam",
               loss="binary_crossentropy" if binary else "sparse_categorical_crossentropy",
               metrics=["accuracy"])
    dl.fit(A, y_tr, validation_data=(B, y_val), epochs=150, batch_size=32, verbose=2,
           callbacks=[tf.keras.callbacks.EarlyStopping(patience=15, restore_best_weights=True)])
    p = dl.predict(C, verbose=0)
    dl_pred = (p.ravel() > 0.5).astype(int) if binary else p.argmax(1)
    dl_acc = accuracy_score(y_te, dl_pred)
    print(f"  DL TEST accuracy: {dl_acc:.4f}")
    print(classification_report(y_te, dl_pred, zero_division=0))

    # ---------------- summary + save ----------------
    print("\n=== SUMMARY (test set) ===")
    ml_label = "XGBoost" if use_xgb else "Random Forest"
    print(f"  ML ({ml_label}): {ml_acc:.4f}")
    print(f"  DL (MLP)      : {dl_acc:.4f}")
    print(f"  Best          : {'ML' if ml_acc >= dl_acc else 'DL'}")

    out_dir = BASE_DIR / "models" if (BASE_DIR / "models").exists() else BASE_DIR
    joblib.dump({"imputer": imp, "model": ml}, out_dir / f"tab_{name}_ml.joblib")
    meta = dict(name=name, columns=list(X.columns), schema=schema, classes=classes,
                ml_model=ml_label,
                dl_model="Neural network (MLP)", ml_acc=float(ml_acc), dl_acc=float(dl_acc),
                best="ml" if ml_acc >= dl_acc else "dl", n_train=int(len(y_tr)))
    json.dump(meta, open(out_dir / f"tab_{name}_meta.json", "w"), indent=2)
    joblib.dump(sc, out_dir / f"tab_{name}_scaler.joblib")
    dl.save(out_dir / f"tab_{name}_dl.keras")
    print(f"Successfully saved tabular models and metadata for '{name}' to {out_dir}")


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in CONFIG:
        sys.exit(f"Usage: python tabular_models.py [{'|'.join(CONFIG)}]")
    run(sys.argv[1])
