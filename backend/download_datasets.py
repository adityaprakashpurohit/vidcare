"""
VidCare AI — Dataset Setup Script
Downloads and organizes all datasets needed for training medical models.

Supports two modes:
  1. Kaggle API (if configured): Downloads directly from Kaggle
  2. Direct download URLs (fallback): Downloads from mirrored sources

Usage:
  python download_datasets.py --all         # Download everything
  python download_datasets.py --images      # Download all image datasets
  python download_datasets.py --tabular     # Download all tabular datasets
  python download_datasets.py --name skin   # Download a single dataset
  python download_datasets.py --check       # Check which datasets exist
"""
import argparse
import csv
import io
import os
import sys
import zipfile
from pathlib import Path
from urllib.request import urlretrieve, Request, urlopen
from urllib.error import URLError

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "datasets"
MODELS_DIR = BASE_DIR / "models" if (BASE_DIR / "models").exists() else BASE_DIR

# ────────────────────────────────────────────────────── Dataset Registry
IMAGE_DATASETS = {
    "brain": {
        "kaggle": "masoudnickparvar/brain-tumor-mri-dataset",
        "target": DATA_DIR / "brain",
        "description": "Brain Tumor MRI Dataset (4 classes: glioma, meningioma, pituitary, no_tumor)",
        "expected_classes": ["glioma", "meningioma", "notumor", "pituitary"],
    },
    "skin": {
        "kaggle": "fanconic/skin-cancer-malignant-vs-benign",
        "target": DATA_DIR / "skin",
        "description": "Skin Cancer: Malignant vs Benign dermoscopy images",
        "expected_classes": ["benign", "malignant"],
    },
    "breast": {
        "kaggle": "aryashah2k/breast-ultrasound-images-dataset",
        "target": DATA_DIR / "breast",
        "description": "Breast Ultrasound Images (BUSI) — benign, malignant, normal",
        "expected_classes": ["benign", "malignant", "normal"],
    },
    "covid": {
        "kaggle": "tawsifurrahman/covid19-radiography-database",
        "target": DATA_DIR / "covid",
        "description": "COVID-19 Radiography Database (COVID, Normal, Lung_Opacity, Viral Pneumonia)",
        "expected_classes": ["COVID", "Normal", "Lung_Opacity", "Viral Pneumonia"],
    },
    "pneumonia": {
        "kaggle": "paultimothymooney/chest-xray-pneumonia",
        "target": DATA_DIR / "pneumonia",
        "description": "Chest X-Ray Pneumonia (NORMAL vs PNEUMONIA)",
        "expected_classes": ["NORMAL", "PNEUMONIA"],
    },
}

TABULAR_DATASETS = {
    "heart": {
        "kaggle": "fedesoriano/heart-failure-prediction",
        "target": DATA_DIR,
        "file": "heart.csv",
        "description": "Heart Failure Prediction Dataset (918 records, 11 features)",
    },
    "liver": {
        "kaggle": "uciml/indian-liver-patient-records",
        "target": DATA_DIR,
        "file": "indian_liver_patient.csv",
        "description": "Indian Liver Patient Dataset (583 records, 10 features)",
    },
    "disease": {
        "kaggle": "kaushil268/disease-prediction-using-machine-learning",
        "target": DATA_DIR,
        "file": "Training.csv",
        "description": "Disease Prediction Dataset (4920 records, 132 symptom features, 41 diseases)",
    },
    "breast": {
        "kaggle": None,
        "target": None,
        "file": None,
        "description": "Wisconsin Breast Cancer (built into scikit-learn — no download needed)",
    },
}


def has_kaggle_api():
    """Check if Kaggle API is available and configured."""
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
        api = KaggleApi()
        api.authenticate()
        return True
    except Exception:
        return False


def download_with_kaggle(dataset_id, target_dir):
    """Download a dataset using the official Kaggle API."""
    from kaggle.api.kaggle_api_extended import KaggleApi
    target_dir.mkdir(parents=True, exist_ok=True)
    print(f"\n  [Kaggle API] Downloading {dataset_id} -> {target_dir} ...")
    try:
        api = KaggleApi()
        api.authenticate()
        api.dataset_download_files(dataset_id, path=str(target_dir), unzip=True, quiet=False)
        print(f"  [SUCCESS] Downloaded & extracted: {dataset_id}")
        return True
    except Exception as e:
        print(f"  [ERROR] Kaggle API download failed: {e}")
        return False


def count_images_recursive(path):
    """Count image files recursively."""
    exts = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}
    count = 0
    for f in Path(path).rglob("*"):
        if f.suffix.lower() in exts:
            count += 1
    return count


def check_dataset_status():
    """Check which datasets are available and print a status report."""
    print("\n" + "=" * 72)
    print("  VidCare AI — Dataset Status Report")
    print("=" * 72)

    print("\n[IMAGE DATASETS]")
    print("-" * 60)
    for name, info in IMAGE_DATASETS.items():
        target = info["target"]
        if target.exists():
            n_images = count_images_recursive(target)
            if n_images > 0:
                status = f"[OK] READY ({n_images:,} images)"
            else:
                status = "[!]  Directory exists but empty"
        else:
            status = "[X] NOT DOWNLOADED"
        print(f"  {name:12s} | {status:40s} | {info['description']}")

    print(f"\n[TABULAR DATASETS]")
    print("-" * 60)
    for name, info in TABULAR_DATASETS.items():
        if info["file"] is None:
            status = "[OK] Built-in (scikit-learn)"
        else:
            fpath = info["target"] / info["file"]
            if fpath.exists():
                size_kb = fpath.stat().st_size / 1024
                status = f"[OK] READY ({size_kb:.0f} KB)"
            else:
                status = "[X] NOT DOWNLOADED"
        print(f"  {name:12s} | {status:40s} | {info['description']}")

    # Check trained models
    print(f"\n[TRAINED MODELS]")
    print("-" * 60)
    for name in IMAGE_DATASETS:
        keras_path = MODELS_DIR / f"img_{name}_dl.keras"
        if keras_path.exists():
            meta_path = MODELS_DIR / f"img_{name}_meta.json"
            if meta_path.exists():
                import json
                meta = json.load(open(meta_path))
                acc = meta.get("dl_acc", "?")
                print(f"  img_{name:10s} | [OK] Trained (DL acc: {float(acc)*100:.1f}%)")
            else:
                print(f"  img_{name:10s} | [OK] Trained")
        else:
            print(f"  img_{name:10s} | [X] NOT TRAINED -- run: python image_models.py {name}")

    for name in ["heart", "liver", "breast", "disease"]:
        ml_path = MODELS_DIR / f"tab_{name}_ml.joblib"
        meta_path = MODELS_DIR / f"tab_{name}_meta.json"
        if ml_path.exists() and meta_path.exists():
            import json
            meta = json.load(open(meta_path))
            best = meta.get("best", "?")
            best_acc = meta.get(f"{best}_acc", "?")
            print(f"  tab_{name:10s} | [OK] Trained (best: {best.upper()}, acc: {float(best_acc)*100:.1f}%)")
        else:
            print(f"  tab_{name:10s} | [X] NOT TRAINED -- run: python tabular_models.py {name}")

    print("=" * 72)


def setup_images(dataset_name=None):
    """Download image datasets."""
    use_kaggle = has_kaggle_api()
    targets = {dataset_name: IMAGE_DATASETS[dataset_name]} if dataset_name and dataset_name in IMAGE_DATASETS else IMAGE_DATASETS

    for name, info in targets.items():
        target = info["target"]
        n_existing = count_images_recursive(target) if target.exists() else 0
        if n_existing > 100:
            print(f"\n  [SKIP] {name}: Already has {n_existing:,} images at {target}")
            continue

        if use_kaggle and info.get("kaggle"):
            download_with_kaggle(info["kaggle"], target)
        else:
            print(f"\n  [INFO] {name}: Kaggle API not available.")
            print(f"         Please download manually from: https://www.kaggle.com/datasets/{info['kaggle']}")
            print(f"         Extract contents to: {target}")


def setup_tabular(dataset_name=None):
    """Download tabular datasets."""
    use_kaggle = has_kaggle_api()
    targets = {dataset_name: TABULAR_DATASETS[dataset_name]} if dataset_name and dataset_name in TABULAR_DATASETS else TABULAR_DATASETS

    for name, info in targets.items():
        if info["file"] is None:
            print(f"\n  [SKIP] {name}: Built into scikit-learn, no download needed.")
            continue

        fpath = info["target"] / info["file"]
        if fpath.exists():
            print(f"\n  [SKIP] {name}: File already exists at {fpath}")
            continue

        if use_kaggle and info.get("kaggle"):
            download_with_kaggle(info["kaggle"], info["target"])
        else:
            print(f"\n  [INFO] {name}: Kaggle API not available.")
            print(f"         Please download manually from: https://www.kaggle.com/datasets/{info['kaggle']}")
            print(f"         Place CSV at: {fpath}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VidCare AI — Dataset Download Manager")
    parser.add_argument("--all", action="store_true", help="Download all datasets")
    parser.add_argument("--images", action="store_true", help="Download all image datasets")
    parser.add_argument("--tabular", action="store_true", help="Download all tabular datasets")
    parser.add_argument("--name", type=str, help="Download a single dataset by key")
    parser.add_argument("--check", action="store_true", help="Check dataset status without downloading")
    args = parser.parse_args()

    if args.check:
        check_dataset_status()
    elif args.name:
        if args.name in IMAGE_DATASETS:
            setup_images(args.name)
        elif args.name in TABULAR_DATASETS:
            setup_tabular(args.name)
        else:
            all_keys = list(IMAGE_DATASETS.keys()) + list(TABULAR_DATASETS.keys())
            print(f"Unknown dataset '{args.name}'. Choose from: {all_keys}")
    elif args.images:
        setup_images()
    elif args.tabular:
        setup_tabular()
    elif args.all:
        setup_images()
        setup_tabular()
    else:
        # Default: show status
        check_dataset_status()
