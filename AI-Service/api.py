# api.py - FastAPI server cho plant disease diagnosis (TensorFlow/Keras)
import os
import json
import numpy as np
from io import BytesIO
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input

# === CONFIG ===
MODEL_PATH = "best.h5"
CLASS_NAMES_PATH = "class_names.json"
IMG_SIZE = (224, 224)  # Model input size

# === LOAD MODEL & CLASSES ===
print("Loading model...")
model = load_model(MODEL_PATH)
print(f"Model loaded. Input shape: {model.input_shape}, Output classes: {model.output_shape[-1]}")

with open(CLASS_NAMES_PATH, "r") as f:
    class_data = json.load(f)
    index_to_class = class_data["index_to_class"]
print(f"Loaded {len(index_to_class)} class names")

# === FASTAPI APP ===
app = FastAPI(
    title="Plant Disease Diagnosis API",
    description="AI-powered plant disease diagnosis using TensorFlow/Keras",
    version="1.0.0"
)

# CORS for localhost development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def preprocess_image(image: Image.Image) -> np.ndarray:
    """Preprocess image for EfficientNetB0 model."""
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(IMG_SIZE)
    img_array = np.array(image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)  # ImageNet standard scaling
    return img_array


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "Plant Disease Diagnosis API"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict plant disease from uploaded image.

    - **file**: Image file (JPEG, PNG, WebP)
    Returns: {class_id, label, confidence}
    """
    # Validate file
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format. Allowed: {', '.join(allowed_types)}"
        )

    try:
        # Read and preprocess image
        contents = await file.read()
        image = Image.open(BytesIO(contents))

        # Check image is valid
        if image.width < 32 or image.height < 32:
            raise HTTPException(status_code=400, detail="Image too small (min 32x32)")

        # Preprocess
        img_array = preprocess_image(image)

        # Predict
        predictions = model.predict(img_array, verbose=0)[0]

        # Get highest probability class
        class_id = int(np.argmax(predictions))
        confidence = float(predictions[class_id])
        label = index_to_class[str(class_id)]

        return {
            "class_id": class_id,
            "label": label,
            "confidence": round(confidence, 4)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
