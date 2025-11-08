from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
from PIL import Image
import io
from fridge_ingredients import get_ingredients_from_image

# Create app
app = FastAPI(
    title="Sustainabite API",
    description="AI-powered sustainable cooking assistant",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Data models
class DetectionResponse(BaseModel):
    success: bool
    ingredients: List[str]
    count: int


class PantryData(BaseModel):
    ingredients: List[str]
    budget: float
    utensils: List[str]


# ROOT
@app.get("/")
def home():
    return {
        "app": "Sustainabite",
        "status": "online",
        "endpoints": ["/api/detect", "/api/pantry", "/api/chat", "/docs"]
    }


# Detect ingredients from images
@app.post("/api/detect", response_model=DetectionResponse)
async def detect(images: List[UploadFile] = File(...)):
    """Upload images and detect ingredients"""
    
    if not images:
        raise HTTPException(status_code=400, detail="No images provided")
    
    all_ingredients = set()
    
    for img_file in images:
        if not img_file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"{img_file.filename} is not an image")
        
        try:
            contents = await img_file.read()
            image = Image.open(io.BytesIO(contents))
            ingredients = get_ingredients_from_image(image)
            all_ingredients.update(ingredients)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
    return DetectionResponse(
        success=True,
        ingredients=sorted(list(all_ingredients)),
        count=len(all_ingredients)
    )


# Submit pantry
@app.post("/api/pantry")
async def submit_pantry(data: PantryData):
    """Save pantry data"""
    
    if not data.ingredients:
        raise HTTPException(status_code=400, detail="No ingredients")
    
    # TODO: Save to database later
    
    return {
        "success": True,
        "message": "Pantry saved",
        "data": {
            "ingredients": data.ingredients,
            "budget": data.budget,
            "utensils": data.utensils
        }
    }


# Chat (placeholder for now)
@app.post("/api/chat")
async def chat(message: str):
    """Chat with AI for recipes"""
    
    # TODO: Add Claude API integration later
    
    return {
        "success": True,
        "user_message": message,
        "ai_response": "AI integration coming soon!",
    }


# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)