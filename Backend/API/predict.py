import tensorflow as tf
from tensorflow.keras.optimizers import Adam
from huggingface_hub import hf_hub_download
import os , shutil 
from dotenv import load_dotenv
import gc

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

model = None
MODEL_PATH = None


def load_model_once():
    """
    Downloads and loads the model once into memory.
    This is called only on app startup.
    """
    global model, MODEL_PATH

    if model is not None:
        return model  # already loaded

    HF_TOKEN = os.getenv("HF_TOKEN")
    REPO_ID = os.getenv("REPO_ID")
    MODEL_FILENAME = os.getenv("MODEL")

    # Ensure local dir exists
    local_dir = "Minor_Project/Backend/models"
    os.makedirs(local_dir, exist_ok=True)

    # Download model if not cached
    MODEL_PATH = hf_hub_download(
        repo_id=REPO_ID,
        filename=MODEL_FILENAME,
        local_dir=local_dir,
        local_dir_use_symlinks=False,
        token=HF_TOKEN,
    )

    print(f"✅ Model downloaded at: {MODEL_PATH}")

    # Load once and compile
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    model.compile(optimizer=Adam(learning_rate=0.001),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])

    print("✅ Model loaded and ready")
    return model


def predict_from_tensor(img_tensor):
    """
    Takes a preprocessed image tensor, runs model inference,
    and returns predicted class label and confidence.
    """
    global model 
    if model is None:
        model = load_model_once()

    preds = model.predict(img_tensor)
    pred_class = preds.argmax(axis=1)[0]
    confidence = float(preds[0][pred_class])

    label_map = {0: "Fake", 1: "Real"}  # Adjust as per your classes
    predicted_label = label_map.get(pred_class, "Unknown")

    gc.collect()

    return predicted_label, confidence
