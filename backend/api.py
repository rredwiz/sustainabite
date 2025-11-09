print("--- Sustainabite API Starting ---")

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
from PIL import Image
import io
import json
import sys
import os
import google.generativeai as genai
from fridge_ingredients import get_ingredients_from_image
from dotenv import load_dotenv

load_dotenv()

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


# Configure Gemini AI
try:
    print("--- Checking for Gemini API key... ---")
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    genai.configure(api_key=GEMINI_API_KEY)
    generation_config = {
        "response_mime_type": "application/json",
    }
    gemini_model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config=generation_config
    )
    print("--- Gemini API configured successfully. ---")
except KeyError:
    print("\n[WARNING] 'GEMINI_API_KEY' environment variable not set.")
    print("Recipe generation endpoints will not work.")
    gemini_model = None
except Exception as e:
    print(f"[WARNING] Error configuring Gemini API: {e}")
    gemini_model = None


# Data models
class DetectionResponse(BaseModel):
    success: bool
    ingredients: List[str]
    count: int


class PantryData(BaseModel):
    ingredients: List[str]
    budget: float
    utensils: List[str]


class RecipeRequest(BaseModel):
    available_ingredients: List[str]
    available_utensils: List[str]
    preference: str
    budget: float = 5.0


class RecipeResponse(BaseModel):
    name: str
    ingredients: List[str]
    cooking_time: str
    utensils_used: List[str]
    steps: List[str]
    carbon_score: float


class FullResponse(BaseModel):
    Title: str
    recipes: List[RecipeResponse]


# Helper function for recipe generation
def create_master_prompt(request: RecipeRequest) -> str:
    ingredients_str = ", ".join(request.available_ingredients)
    utensils_str = ", ".join(request.available_utensils)

    one_shot_example = """
    {
      "Title": "Here are 3 great recipe ideas! You could also grab a quick veggie sub for under $5.00.",
      "recipes": [
        {
          "name": "Spicy Lentil Soup",
          "ingredients": ["lentils", "onion", "hot sauce"],
          "cooking_time": "25 minutes",
          "utensils_used": ["pot", "bowl"],
          "steps": ["Chop onion.", "Boil lentils.", "Add hot sauce."],
          "carbon_score": 0.1
        },
        {
          "name": "Simple Onion Omelette",
          "ingredients": ["eggs", "onion", "hot sauce"],
          "cooking_time": "10 minutes",
          "utensils_used": ["pan", "bowl"],
          "steps": ["Chop onion.", "Beat eggs.", "Fry in pan."],
          "carbon_score": 0.3
        }
      ]
    }
    """

    return f"""
    You are a strict and creative recipe assistant with a focus on sustainability.
    Your task is to generate the **top 3 recipes** based on user constraints and rank them.

    HERE ARE THE USER'S CONSTRAINTS:
    1.  Available Ingredients: {ingredients_str}
    2.  Available Utensils: {utensils_str}
    3.  User Preference: {request.preference}
    4.  User Budget: ${request.budget}

    HERE ARE YOUR RULES:
    1.  HARD CONSTRAINT: Recipes MUST ONLY use ingredients from the `Available Ingredients` list.
        Do not add any extra ingredients (like "salt" or "water") unless they are in the list.
    2.  HARD CONSTRAINT: Recipes MUST ONLY use utensils from the `Available Utensils` list.
    3.  HARD CONSTRAINT: Each recipe MUST use between 2 and 14 ingredients from the list.
    
    SCORING AND RANKING:
    You must *internally* calculate two scores, but you will only output one:
    1.  (Internal) `preference_score`: How well the recipe matches the `User Preference`.
    2.  (Output) `carbon_score`: A float (0.0-1.0) estimating the carbon footprint (0.0=low, 1.0=high).
    
    FINAL SORTING:
    The final list of **top 3 recipes** MUST be sorted from best to worst.
    The "best" recipes are those with the **HIGHEST `preference_score`** (internal)
    and the **LOWEST `carbon_score`** (external).
    You must balance these two factors to create the final 3-item list.

    OUTPUT FORMAT:
    You must only output a valid JSON object. Do not use markdown (```json).
    Your response MUST be a single JSON object with exactly two top-level keys: "Title" and "recipes".
    
    1.  "Title" (string): This must be an interactive intro line. It must mention it is 
        displaying recommended recipes AND suggest one simple, cheap meal idea (like a 
        sandwich or a specific item) that can be bought within the user's ${request.budget} budget.
    
    2.  "recipes" (list): A list of the top 3 recipe objects, sorted by your internal ranking.
        Each recipe object in the list must have exactly these 6 keys:
        - "name" (string)
        - "ingredients" (list of strings used from the user's list)
        - "cooking_time" (string, e.g., "30 minutes")
        - "utensils_used" (list of strings used from the user's list)
        - "steps" (list of strings)
        - "carbon_score" (float, 0.0-1.0)

    Here is an example of a perfect response for a different query: {one_shot_example}
    """


# ROOT
@app.get("/")
def home():
    return {
        "app": "Sustainabite",
        "status": "online",
        "endpoints": ["/api/detect", "/api/pantry", "/api/recipes", "/api/chat", "/health", "/docs"],
        "gemini_available": gemini_model is not None
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


# Health check for Gemini API
@app.get("/health")
def health_check():
    """Check if the server and Gemini API are ready"""
    return {
        "status": "ok",
        "model": "gemini-2.5-flash" if gemini_model else "not_configured",
        "gemini_available": gemini_model is not None
    }


# Get recipes from Gemini AI
@app.post("/api/recipes", response_model=FullResponse)
async def get_recipes(request: RecipeRequest):
    """Generate recipes based on available ingredients, utensils, preferences, and budget"""
    
    if not gemini_model:
        raise HTTPException(
            status_code=503,
            detail="Gemini API not configured. Please set GEMINI_API_KEY environment variable."
        )
    
    if not request.available_ingredients:
        raise HTTPException(status_code=400, detail="No ingredients provided")
    
    if not request.available_utensils:
        raise HTTPException(status_code=400, detail="No utensils provided")
    
    prompt = create_master_prompt(request)
    
    try:
        print("--- Sending recipe request to Gemini API... ---")
        response = await gemini_model.generate_content_async(prompt)
        
        print("--- Received response from Gemini. ---")
        json_response = json.loads(response.text)
        
        return json_response
    
    except json.JSONDecodeError:
        print(f"[ERROR] Gemini returned invalid JSON: {response.text}")
        raise HTTPException(
            status_code=500,
            detail="Gemini API returned invalid JSON. Please try again."
        )
    except Exception as e:
        print(f"[ERROR] Error with Gemini API: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recipes: {str(e)}"
        )


# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)