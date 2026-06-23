# api.py - FastAPI inference service cho AI Plant Disease Diagnosis
# Nhận ảnh upload, chạy EfficientNet inference, trả về kết quả dự đoán

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image
import json
import io

app = FastAPI(
    title="Plant Disease Diagnosis API",
    description="AI service for plant disease detection using EfficientNet",
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

# Global variables for model and class names
model = None
class_names = None
device = None

# Image preprocessing transform (ImageNet normalization)
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def load_model():
    """Load EfficientNet model and class names at startup."""
    global model, class_names, device
    
    # Determine device (CUDA if available, else CPU)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Load class names
    with open("class_names.json", "r") as f:
        class_names = json.load(f)
    
    # Initialize EfficientNet-B0 model
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    
    # Replace classifier for our number of classes
    num_classes = len(class_names)
    model.classifier = torch.nn.Sequential(
        torch.nn.Dropout(p=0.2, inplace=True),
        torch.nn.Linear(model.classifier[1].in_features, num_classes)
    )
    
    # Load trained weights
    try:
        model.load_state_dict(torch.load("best.pt", map_location=device, weights_only=True))
        print("Model loaded successfully from best.pt")
    except FileNotFoundError:
        print("Warning: best.pt not found. Using pretrained ImageNet weights.")
        print("Place your trained model file (best.pt) in the same directory.")
    
    # Set to evaluation mode
    model.eval()
    model.to(device)


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
        "device": str(device) if device else "unknown",
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
    # Validate file
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    # Check file type
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
        
        # Convert to RGB (handles RGBA, grayscale, etc.)
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Preprocess image
        input_tensor = preprocess(image)
        input_batch = input_tensor.unsqueeze(0).to(device)
        
        # Run inference
        with torch.no_grad():
            outputs = model(input_batch)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        
        # Get top prediction
        confidence, predicted_idx = torch.max(probabilities, dim=0)
        
        class_id = predicted_idx.item()
        label = class_names[class_id] if class_names else f"class_{class_id}"
        confidence_score = confidence.item()
        
        return {
            "class_id": class_id,
            "label": label,
            "confidence": round(confidence_score, 4)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
