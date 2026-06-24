# api.py - FastAPI inference service cho AI Plant Disease Diagnosis
# Nhận ảnh upload, chạy YOLO inference, trả về kết quả dự đoán

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import json
import io

app = FastAPI(
    title="Plant Disease Diagnosis API",
    description="AI service for plant disease detection using YOLO",
    version="1.0.0"
)

# CORS configuration for localhost development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model = None
class_names = None


def load_model():
    """Load YOLO classifier model and class names at startup."""
    global model, class_names
    
    # Load class names
    with open("class_names.json", "r") as f:
        class_names = json.load(f)
    
    # Load YOLO classifier
    try:
        model = YOLO("best.pt")
        print("YOLO model loaded successfully from best.pt")
    except FileNotFoundError:
        print("Warning: best.pt not found.")
        model = None


@app.on_event("startup")
async def startup_event():
    """Load model when server starts."""
    load_model()


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "Plant Disease Diagnosis API",
        "model_loaded": model is not None,
        "num_classes": len(class_names) if class_names else 0
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "model_ready": model is not None
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict plant disease from uploaded image.
    
    - **file**: Image file (multipart/form-data, field name: "file")
    
    Returns:
        - class_id: Index of predicted class
        - label: Name of the predicted disease/condition
        - confidence: Prediction confidence score (0-1)
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    content_type = file.content_type or ""
    
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_types)}"
        )
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Run YOLO inference
        results = model.predict(image, verbose=False)
        
        # Get top prediction
        result = results[0]
        probs = result.probs
        
        class_id = int(probs.top1)
        confidence = float(probs.top1conf)
        label = class_names[class_id] if class_names and class_id < len(class_names) else f"class_{class_id}"
        
        return {
            "class_id": class_id,
            "label": label,
            "confidence": round(confidence, 4)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
