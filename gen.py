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
    description="Finds and ranks 3 recipes by preference and carbon footprint."
)

# --- 2. LOAD GEMINI API KEY ---
try:
    print("--- Checking for API key... ---")
    GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
    genai.configure(api_key=GEMINI_API_KEY)
    print("--- API key found. ---")
except KeyError:
    print("\n[FATAL ERROR] 'GEMINI_API_KEY' environment variable not set.")
    print("Please CLOSE this terminal, OPEN a new one, and set the key before running.")
    sys.exit(1)
except Exception as e:
    print(f"[FATAL ERROR] An unknown error occurred with the API key: {e}")
    sys.exit(1)

# --- 3. CONFIGURE GEMINI MODEL ---
print("--- Configuring Gemini model... ---")
generation_config = {
    "response_mime_type": "application/json",
}
gemini_model = genai.GenerativeModel(
    # Using the model name that you previously confirmed works
    model_name="gemini-2.5-flash", 
    generation_config=generation_config
)

# --- 4. PYDANTIC MODELS (HEAVILY UPDATED) ---

class RecipeRequest(BaseModel):
    available_ingredients: List[str]
    available_utensils: List[str]
    preference: str
    # We add budget as a new input field
    budget: float = 5.0 

# This model defines the structure for a SINGLE recipe
class RecipeResponse(BaseModel):
    name: str
    ingredients: List[str]
    cooking_time: str # New field
    utensils_used: List[str] # New field
    steps: List[str]
    carbon_score: float

# This is the NEW top-level response model
class FullResponse(BaseModel):
    Title: str # The new intro line
    recipes: List[RecipeResponse]

# --- 5. THE "MASTER PROMPT" (HEAVILY UPDATED) ---
def create_master_prompt(request: RecipeRequest) -> str:
    
    ingredients_str = ", ".join(request.available_ingredients)
    utensils_str = ", ".join(request.available_utensils)

    # We update the one-shot example to match the new structure
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

# --- 6. API ENDPOINTS ---

@app.get("/health")
def health_check_endpoint():
    """Checks if the server is running."""
    return {"status": "ok", "model": "gemini-2.5-flash"}

# We update the response_model to our new top-level object
@app.post("/get-recipes", response_model=FullResponse)
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