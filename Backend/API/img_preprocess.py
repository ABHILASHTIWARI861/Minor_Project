
import tensorflow as tf
import numpy as np
from PIL import Image
import cv2
from mtcnn import MTCNN
import os

# Initialize the face detector once
detector = MTCNN()


TARGET_SIZE = (128, 128)

def load_and_detect_face(image_path):
    """
    Loads an image, detects the largest face, and crops it.
    If no face is found, a center crop fallback is used.
    """
    # Load and convert to RGB
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Unable to load image from {image_path}")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Detect faces
    detections = detector.detect_faces(image)

    if len(detections) > 0:
        # Get the largest detected face
        faces_sorted = sorted(detections, key=lambda d: d['box'][2] * d['box'][3], reverse=True)
        x, y, w, h = faces_sorted[0]['box']
        x, y = max(0, x), max(0, y)
        cropped = image[y:y+h, x:x+w]
    else:
        # If no face detected, crop center
        h, w, _ = image.shape
        side = min(h, w)
        startx = w//2 - side//2
        starty = h//2 - side//2
        cropped = image[starty:starty+side, startx:startx+side]

    # Resize to target size
    resized = cv2.resize(cropped, TARGET_SIZE)
    return resized

def preprocess_image(image_path):
    """
    Main preprocessing function:
    1. Loads and crops the face.
    2. Normalizes pixel values to [0, 1].
    3. Expands to a batch tensor for model prediction.
    """
    face_img = load_and_detect_face(image_path)

    # Convert to TensorFlow tensor
    face_tensor = tf.convert_to_tensor(face_img, dtype=tf.float32)
    face_tensor = face_tensor / 255.0  # Normalize to [0, 1]

    # Add batch dimension
    face_tensor = tf.expand_dims(face_tensor, axis=0)  # (1, H, W, 3)
    return face_tensor



if __name__ == "__main__":
    test_path = "sample.jpg"  # Replace with your actual image path
    tensor = preprocess_image(test_path)
    print("Processed image tensor shape:", tensor.shape)
    
    import matplotlib.pyplot as plt
    import numpy as np
    
    # Convert tensor back to image for visualization
    img = tensor.numpy()[0]  # Remove batch dimension
    img_display = (img * 255).astype(np.uint8)  # Scale back to 0-255
    
    plt.imshow(img_display)
    plt.title("Preprocessed Image")
    plt.axis('off')
    plt.show()
