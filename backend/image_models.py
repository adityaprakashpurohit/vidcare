"""
Medical image models: one ML model (HOG + SVM) and one DL model (EfficientNetB0
transfer learning) per disease. Accuracy is printed while training.

Run:   python image_models.py pneumonia | covid | brain | skin | breast
Predict one image:   python image_models.py predict pneumonia my_xray.jpg

Folder layout (class sub-folders inside each folder, see CONFIG below).
"""
import json
import sys
import os
from pathlib import Path

import joblib
import numpy as np
import tensorflow as tf
from PIL import Image
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.utils.class_weight import compute_class_weight

try:
    from skimage.feature import hog
except ImportError:
    # Basic fallback or warning
    def hog(img, **kwargs):
        # Fallback simple gradient histogram if skimage not installed
        gx = np.gradient(img, axis=1)
        gy = np.gradient(img, axis=0)
        mag = np.hypot(gx, gy)
        return mag.ravel()[:576]

IMG, BATCH, MAX_ML = (224, 224), 32, 3000   # MAX_ML caps images used by the slow HOG+SVM model
AUTO = tf.data.AUTOTUNE
EXT = {".jpg", ".jpeg", ".png", ".bmp"}
BASE_DIR = Path(__file__).resolve().parent

# Check both backend/data and ../data or data
def find_data_path(rel_path):
    if not rel_path:
        return None
    clean_rel = rel_path[5:] if rel_path.startswith("data/") else rel_path
    candidates = [
        BASE_DIR / "datasets" / clean_rel,
        BASE_DIR / "datasets" / rel_path,
        BASE_DIR / rel_path,
        BASE_DIR.parent / "datasets" / clean_rel,
        BASE_DIR.parent / rel_path,
        Path(rel_path)
    ]
    for c in candidates:
        if c.exists():
            return c
    return BASE_DIR / "datasets" / clean_rel

CONFIG = {
    # Kaggle: paultimothymooney/chest-xray-pneumonia
    "pneumonia": dict(root="data/pneumonia/chest_xray", train="train", test="test"),
    # Kaggle: tawsifurrahman/covid19-radiography-database (classes: COVID, Normal, Lung_Opacity, Viral Pneumonia)
    "covid": dict(root="data/covid/COVID-19_Radiography_Dataset", train=None, test=None),
    # Kaggle: masoudnickparvar/brain-tumor-mri-dataset
    "brain": dict(root="data/brain", train="Training", test="Testing"),
    # Kaggle: fanconic/skin-cancer-malignant-vs-benign
    "skin": dict(root="data/skin", train="train", test="test"),
    # Kaggle: aryashah2k/breast-ultrasound-images-dataset (classes: benign, malignant, normal)
    "breast": dict(root="data/breast/Dataset_BUSI_with_GT", train=None, test=None),
}


# ---------------------------------------------------------------- data
def paths_labels(root):
    root = Path(root)
    if not root.exists():
        raise FileNotFoundError(f"Directory not found: {root}")
    classes = sorted(d.name for d in root.iterdir() if d.is_dir())
    files, labels = [], []
    for i, c in enumerate(classes):
        for p in (root / c).rglob("*"):
            rel = p.relative_to(root)
            if p.suffix.lower() in EXT and not any("mask" in s.lower() for s in rel.parts):
                files.append(str(p))
                labels.append(i)
    return files, labels, classes


def get_splits(cfg):
    root = find_data_path(cfg["root"])
    if not root.exists():
        raise FileNotFoundError(f"Dataset root '{cfg['root']}' does not exist at {root}. "
                                f"Please download the dataset into data/ folder.")
    if cfg["test"]:                                   # dataset already has a test folder
        train_path = root / cfg["train"]
        test_path = root / cfg["test"]
        f, l, classes = paths_labels(train_path)
        f_te, l_te, _ = paths_labels(test_path)
    else:                                             # single folder -> make our own test split
        f, l, classes = paths_labels(root)
        f, f_te, l, l_te = train_test_split(f, l, test_size=0.15, stratify=l, random_state=42)
    f_tr, f_val, l_tr, l_val = train_test_split(f, l, test_size=0.15, stratify=l, random_state=42)
    return (f_tr, l_tr), (f_val, l_val), (f_te, l_te), classes


def make_ds(files, labels, training=False):
    ds = tf.data.Dataset.from_tensor_slices((files, labels))
    if training:
        ds = ds.shuffle(len(files), seed=42)

    def load(path, label):
        img = tf.io.decode_image(tf.io.read_file(path), channels=3, expand_animations=False)
        img.set_shape([None, None, 3])
        return tf.image.resize(img, IMG), label

    return ds.map(load, num_parallel_calls=AUTO).batch(BATCH).prefetch(AUTO)


# ---------------------------------------------------------------- ML
def hog_features(files):
    return np.array([
        hog(np.asarray(Image.open(f).convert("L").resize((128, 128))),
            pixels_per_cell=(16, 16), cells_per_block=(2, 2))
        for f in files
    ])


def run_ml(tr, val, te):
    rng = np.random.RandomState(42)

    def sub(files, labels):
        idx = rng.permutation(len(files))[:MAX_ML]
        return [files[i] for i in idx], np.array(labels)[idx]

    (ftr, ytr), (fva, yva), (fte, yte) = sub(*tr), sub(*val), sub(*te)
    print("  extracting HOG features ...")
    Xtr, Xva, Xte = hog_features(ftr), hog_features(fva), hog_features(fte)
    print("  training SVM ...")
    svm = SVC(C=10, kernel="rbf", class_weight="balanced", probability=True).fit(Xtr, ytr)
    print(f"  train acc {svm.score(Xtr, ytr):.4f} | val acc {svm.score(Xva, yva):.4f}")
    acc = svm.score(Xte, yte)
    print(f"  ML TEST accuracy: {acc:.4f}")
    print(classification_report(yte, svm.predict(Xte), zero_division=0))
    return svm, acc


# ---------------------------------------------------------------- DL
def run_dl(tr, val, te, classes):
    n = len(classes)
    train_ds, val_ds, test_ds = make_ds(*tr, training=True), make_ds(*val), make_ds(*te)
    cw = dict(enumerate(compute_class_weight("balanced", classes=np.arange(n), y=np.array(tr[1]))))

    # Use MobileNetV2 (compatible with Keras 3.x weight format)
    base = tf.keras.applications.MobileNetV2(include_top=False, weights="imagenet",
                                                input_shape=IMG + (3,))
    base.trainable = False
    inp = tf.keras.Input(IMG + (3,))
    x = tf.keras.layers.RandomFlip("horizontal")(inp)
    x = tf.keras.layers.RandomRotation(0.1)(x)
    x = tf.keras.layers.RandomZoom(0.1)(x)
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    out = tf.keras.layers.Dense(n, activation="softmax")(x)
    model = tf.keras.Model(inp, out)

    stop = tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True)

    print("  Phase 1: train the new top layers (live batches, loss, acc, ETA)")
    model.compile(tf.keras.optimizers.Adam(1e-3), "sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(train_ds, validation_data=val_ds, epochs=10, class_weight=cw, callbacks=[stop], verbose=1)

    print("  Phase 2: fine-tune the last 30 layers of MobileNetV2 with a low learning rate")
    base.trainable = True
    for layer in base.layers[:-30]:
        layer.trainable = False
    for layer in base.layers:                       # keep BatchNorm frozen
        if isinstance(layer, tf.keras.layers.BatchNormalization):
            layer.trainable = False
    model.compile(tf.keras.optimizers.Adam(1e-5), "sparse_categorical_crossentropy", metrics=["accuracy"])
    model.fit(train_ds, validation_data=val_ds, epochs=10, class_weight=cw, callbacks=[stop], verbose=1)

    acc = model.evaluate(test_ds, verbose=0)[1]
    print(f"  DL TEST accuracy: {acc:.4f}")
    pred = model.predict(test_ds, verbose=0).argmax(1)
    print(classification_report(te[1], pred, target_names=classes, zero_division=0))
    return model, acc


# ---------------------------------------------------------------- main
def run(name):
    tr, val, te, classes = get_splits(CONFIG[name])
    print(f"\n=== {name}: classes {classes} | train {len(tr[0])} | val {len(val[0])} | test {len(te[0])} ===")
    print("\n--- ML model: HOG + SVM ---")
    svm, ml_acc = run_ml(tr, val, te)
    print("\n--- DL model: EfficientNetB0 transfer learning ---")
    model, dl_acc = run_dl(tr, val, te, classes)

    print("\n=== SUMMARY (test set) ===")
    print(f"  ML (HOG + SVM)   : {ml_acc:.4f}")
    print(f"  DL (EfficientNet): {dl_acc:.4f}")
    print(f"  Best             : {'ML' if ml_acc >= dl_acc else 'DL'}")

    out_dir = BASE_DIR / "models" if (BASE_DIR / "models").exists() else BASE_DIR
    joblib.dump(svm, out_dir / f"img_{name}_ml.joblib")
    model.save(out_dir / f"img_{name}_dl.keras")
    json.dump(classes, open(out_dir / f"img_{name}_classes.json", "w"), indent=2)
    json.dump(dict(ml_model="HOG + SVM", dl_model="MobileNetV2", ml_acc=float(ml_acc),
                   dl_acc=float(dl_acc), n_train=len(tr[0])),
              open(out_dir / f"img_{name}_meta.json", "w"), indent=2)
    print(f"Successfully saved models and metadata for '{name}' to {out_dir}")


def predict(name, path):
    out_dir = BASE_DIR / "models" if (BASE_DIR / "models").exists() else BASE_DIR
    model = tf.keras.models.load_model(out_dir / f"img_{name}_dl.keras")
    classes = json.load(open(out_dir / f"img_{name}_classes.json"))
    img = np.asarray(Image.open(path).convert("RGB").resize(IMG), dtype="float32")[None]
    probs = model.predict(img, verbose=0)[0]
    print(f"\nPrediction for '{name}' on {path}:")
    for c, p in sorted(zip(classes, probs), key=lambda t: -t[1]):
        print(f"  {c:20s} {p:.2%}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) == 3 and a[0] == "predict" and a[1] in CONFIG:
        predict(a[1], a[2])
    elif len(a) == 1 and a[0] in CONFIG:
        run(a[0])
    else:
        sys.exit(f"Usage: python image_models.py [{'|'.join(CONFIG)}]  or  predict <name> <image>")
