import tensorflow as tf
from tensorflow.keras.optimizers import Adam
from huggingface_hub import hf_hub_download
import os , shutil 
from dotenv import load_dotenv
load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

MODEL_PATH = hf_hub_download(
    repo_id = os.getenv("REPO_ID"),
    filename= os.getenv("MODEL"),
    local_dir="Minor_Project/Backend/models",
    local_dir_use_symlinks=False,
    token=HF_TOKEN,
)


model = tf.keras.models.load_model(MODEL_PATH, compile=False)

model.compile(optimizer=Adam(learning_rate=0.001), loss='categorical_crossentropy', metrics=['accuracy'])



def predict_from_tensor(img_tensor):
    """
    Takes a preprocessed image tensor, runs model inference,
    and returns predicted class label and confidence.
    """
    preds = model.predict(img_tensor)
    pred_class = preds.argmax(axis=1)[0]
    confidence = float(preds[0][pred_class])

    label_map = {0: "Fake", 1: "Real"}  # Adjust as per your classes
    predicted_label = label_map.get(pred_class, "Unknown")

    return predicted_label, confidence
