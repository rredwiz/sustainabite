print("--- SCRIPT IS RUNNING ---")

import json
import sys
import uvicorn
import os
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

# --- 1. SETUP ---
app = FastAPI(
    title="Recipe API (Gemini Edition)",
    description="Finds and ranks recipes by preference and carbon footprint."
)

# --- 2. LOAD GEMINI API KEY (MOVED TO THE TOP) ---
try:
    print("--- Checking for API key... ---")
    GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
    genai.configure(api_key=GEMINI_API_KEY)
    print("--- API key found. ---")
except KeyError:
    print("\n[FATAL ERROR] 'GEMINI_API_KEY' environment variable not set.")
    print("Please CLOSE this terminal, OPEN a new one, and set the key before running.")
    sys.exit(1) # Stop the script
except Exception as e:
    print(f"[FATAL ERROR] An unknown error occurred with the API key: {e}")
    sys.exit(1)

# --- 3. CONFIGURE GEMINI MODEL ---
print("--- Configuring Gemini model... ---")
generation_config = {
    "response_mime_type": "application/json",
}
gemini_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash-latest",
    generation_config=generation_config
)

# --- 4. PYDANTIC MODELS ---
class RecipeRequest(BaseModel):
    available_ingredients: List[str]
    available_utensils: List[str]
    preference: str

class RecipeResponse(BaseModel):
    name: str
    ingredients: List[str]
    steps: List[str]
    preference_score: float # 0.0 (low) to 1.0 (high match)
    carbon_score: float     # 0.0 (low) to 1.0 (high footprint)

# --- 5. THE "MASTER PROMPT" ---
def create_master_prompt(request: RecipeRequest) -> str:
    
    ingredients_str = ", ".join(request.available_ingredients)
    utensils_str = ", ".join(request.available_utensils)

    return f"""
    You are a strict and creative recipe assistant with a focus on sustainability.
    Your task is to generate 20 recipes based on user constraints and rank them.

    HERE ARE THE USER'S CONSTRAINTS:
    1.  Available Ingredients: {ingredients_str}
    2.  Available Utensils: {utensils_str}
    3.  User Preference: {request.preference}

    HERE ARE YOUR RULES:
    1.  HARD CONSTRAINT: Recipes MUST ONLY use ingredients from the `Available Ingredients` list.
        Do not add any extra ingredients like "a pinch of salt" or "water" unless they
        are specifically in that list.
    2.  HARD CONSTRAINT: Recipes MUST ONLY use utensils from the `Available Utensils` list.
    3.  HARD CONSTRAINT: Each recipe MUST use between 2 and 14 ingredients from the list.
    
    SCORING AND RANKING:
    You must generate two scores for each recipe:
    1.  `preference_score`: A float (0.0 to 1.0) showing how well the recipe matches the `User Preference`.
    2.  `carbon_score`: A float (0.0 to 1.0) estimating the carbon footprint. (0.0 = low, 1.0 = high)
    
    FINAL SORTING:
    The final list of 3 recipes MUST be sorted from best to worst.
    The "best" recipes have the HIGHEST `preference_score` and the LOWEST `carbon_score`.
    You must balance these two factors to create the final ranking.

    OUTPUT FORMAT:
    You must only output a valid JSON array. Do not use markdown (```json).
    Each object in the array must have these 5 keys:
    - "name": The recipe's title (string).
    - "ingredients": The list of ingredients from the user's list that are used (list of strings).
    - "steps": The step-by-step instructions (list of strings).
    - "preference_score": The float (0.0-1.0) you generated.
    - "carbon_score": The float (0.0-1.0) you generated.
    """

# --- 6. API ENDPOINTS ---

@app.get("/health")
def health_check_endpoint():
    """Checks if the server is running."""
    return {"status": "ok", "model": "gemini-1.5-flash-latest"}

@app.post("/get-recipes", response_model=List[RecipeResponse])
async def get_recipes_endpoint(request: RecipeRequest):
    
    prompt = create_master_prompt(request)
    
    try:
        print("--- Sending prompt to Gemini API... ---")
        response = await gemini_model.generate_content_async(prompt)
        
        print("--- Received response from Gemini. ---")
        json_response = json.loads(response.text)
        
        return json_response

    except json.JSONDecodeError:
        print(f"[ERROR] Gemini returned invalid JSON: {response.text}")
        raise HTTPException(status_code=500, detail="Gemini API returned invalid JSON.")
    except Exception as e:
        print(f"[ERROR] An error occurred with the Gemini API: {e}")
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

# --- 7. RUN THE SERVER ---
if __name__ == "__main__":
    print("--- Starting FastAPI server... ---")
    uvicorn.run(app, host="127.0.0.1", port=8000)