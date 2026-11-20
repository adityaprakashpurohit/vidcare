"""
VidCare AI — Deep Learning Architectures (TensorFlow/Keras)
This module provides reusable model architecture builders.
Note: The main training scripts (image_models.py, tabular_models.py) handle
model creation directly. This module is for reference/utilities.
"""
import tensorflow as tf


def build_efficientnet_classifier(num_classes=2, input_shape=(224, 224, 3)):
    """
    Build an EfficientNetB0-based classifier with transfer learning.
    Used by image_models.py for all image classification tasks.
    """
    base = tf.keras.applications.EfficientNetB0(
        include_top=False, weights="imagenet", input_shape=input_shape
    )
    base.trainable = False

    inp = tf.keras.Input(input_shape)
    x = tf.keras.layers.RandomFlip("horizontal")(inp)
    x = tf.keras.layers.RandomRotation(0.1)(x)
    x = tf.keras.layers.RandomZoom(0.1)(x)
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    out = tf.keras.layers.Dense(num_classes, activation="softmax")(x)
    model = tf.keras.Model(inp, out)
    return model, base


def build_tabular_mlp(input_dim, num_classes=2):
    """
    Build a simple MLP classifier for tabular data.
    Used by tabular_models.py for clinical parameter classification.
    """
    binary = num_classes == 2
    model = tf.keras.Sequential([
        tf.keras.Input(shape=(input_dim,)),
        tf.keras.layers.Dense(128, activation="relu"),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation="relu"),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(
            1 if binary else num_classes,
            activation="sigmoid" if binary else "softmax"
        ),
    ])
    model.compile(
        optimizer="adam",
        loss="binary_crossentropy" if binary else "sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model


def load_dl_model(model_path, num_classes=2):
    """
    Load a trained TensorFlow/Keras model from a .keras file.
    Returns None if file doesn't exist.
    """
    from pathlib import Path
    p = Path(model_path)
    if p.exists():
        try:
            model = tf.keras.models.load_model(str(p))
            print(f"[OK] Loaded DL model from {p}")
            return model
        except Exception as e:
            print(f"[Warning] Could not load model from {p}: {e}")
    else:
        print(f"[Info] Model not found at {p}. Train the model first.")
    return None
