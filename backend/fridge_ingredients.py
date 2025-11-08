from ultralytics import YOLO
import os
import numpy as np
from PIL import Image


model = YOLO("yoloe-11l-seg-pf.pt")

# Safety skip list
SKIP = {
    "food colorings", "person", "storage box", "socket", "mixing bowl", "pot", "pan", "lid",
    "chemistry lab", "appliance", "basket", "container", "basket container",
    "crock pot", "breadbox", "fridge", "bottle", "bottle cap", "sink",
    "chair", "dining table", "cup", "fork", "knife", "spoon", "bowl",
    "tv", "remote", "keyboard", "book",
}

# Map raw or normalized labels to nice ingredient names
FRIENDLY_MAP = {
    "apple": "apples", "banana": "bananas", "orange": "oranges",
    "carrot": "carrots", "broccoli": "broccoli", "tomato": "tomatoes",
    "egg": "eggs", "sandwich": "sandwich", "pizza": "pizza",
    "cake": "cake", "rice": "rice", "boiled rice": "boiled rice",
    "pasta": "pasta", "noodles": "noodles", "bread": "bread",
    "milk": "milk", "cheese": "cheese", "yogurt": "yogurt",
    "butter": "butter", "chicken": "chicken", "fish": "fish",
    "beans": "beans", "lentils": "lentils", "chickpeas": "chickpeas",
    "oats": "oats", "flour": "flour", "sugar": "sugar",
    "oil": "cooking oil", "nuts": "nuts",
}

FOOD_LABELS = {
    # Fruits
    "apple","banana","orange","grape","strawberry","blueberry","raspberry",
    "blackberry","mango","peach","pear","plum","pineapple","watermelon",
    "melon","kiwi","lemon","lime","pomegranate","avocado","coconut",
    # Vegetables
    "carrot","broccoli","tomato","onion","lettuce","cucumber","pepper",
    "bell pepper","corn","garlic","potato","sweet potato","spinach",
    "zucchini","cauliflower","cabbage","celery","radish","ginger",
    "eggplant","beetroot","okra","peas","bean","green beans","mushroom",
    # Dairy and Protein
    "egg","milk","butter","cheese","yogurt","cream","paneer","tofu",
    "chicken","beef","pork","lamb","turkey","fish","salmon","shrimp",
    "prawns","crab","tuna","ham","sausage","bacon","steak","meatballs",
    # Grains and Pantry
    "rice","boiled rice","brown rice","white rice","basmati rice",
    "quinoa","barley","pasta","spaghetti","macaroni","noodles",
    "bread","bun","tortilla","wrap","flour","cornflour","maida",
    "oats","cereal","cornflakes","wheat","semolina","couscous",
    "sugar","salt","oil","olive oil","vinegar",
    "baking powder","baking soda","yeast","honey","jam","peanut butter",
    # Pulses and Legumes
    "beans","kidney beans","black beans","white beans","lentils",
    "red lentils","green lentils","chickpeas","gram","split peas",
    # Snacks and Desserts
    "cupcake","cookie","pastry","donut","chocolate","candy",
    "chips","crisps","popcorn","ice cream","waffle","pancake",
    "muffin","pie","brownie","biscuit","snack","cracker","cake",
    # Prepared and Cooked Dishes
    "sandwich","pizza","burger","hot dog","taco","burrito","sushi",
    "omelette","boiled egg","fried egg","salad","soup","noodle bowl",
    "pasta salad","fried rice","rice bowl","stir fry","wrap","toast",
    "roti","naan","paratha","curry","stew","lasagna", "cilantro", "parsley", "coriander",
    # Condiments and Sauces
    "ketchup","mustard","mayonnaise","soy sauce","chili sauce",
    "barbecue sauce","salsa","pickle","relish",
    "spice","seasoning","herbs","masala","curry powder","pepper",
    # Drinks
    "coffee","tea","milkshake","juice","orange juice","smoothie",
    "soda","water bottle","energy drink","wine","beer", "milk bottle",
    # Misc
    "nuts","almonds","cashew","walnut","peanut","raisins",
    "dates","seeds","sunflower seeds","pumpkin seeds",
}


def normalize_label(raw_name: str) -> str:
    """Normalize model labels so variants map to a common food concept."""
    name = raw_name.strip().lower()

    # Chicken family
    if "chicken" in name:
        return "chicken"

    # Eggs
    if "egg" in name:
        if "boiled" in name:
            return "boiled egg"
        if "fried" in name:
            return "fried egg"
        return "egg"

    # Milk and dairy
    if "milk" in name:
        return "milk"
    if "yogurt" in name or "curd" in name:
        return "yogurt"
    if "cheese" in name:
        return "cheese"
    if "butter" in name or "margarine" in name:
        return "butter"
    if "cream" in name:
        return "cream"

    # Rice family
    if "rice" in name:
        if "fried" in name:
            return "fried rice"
        if "bowl" in name:
            return "rice bowl"
        if "boiled" in name:
            return "boiled rice"
        return "rice"

    # Pasta and noodles
    if "spaghetti" in name or "macaroni" in name or "penne" in name:
        return "pasta"
    if "noodle" in name:
        return "noodles"

    # Bread family
    if "bread" in name or "loaf" in name or "baguette" in name:
        return "bread"

    # Drinks
    if "juice" in name:
        return "juice"
    if "coffee" in name:
        return "coffee"
    if "tea" in name:
        return "tea"
    if "soda" in name or "cola" in name:
        return "soda"
    if "water" in name:
        return "water bottle"
    if "beer" in name:
        return "beer"
    if "wine" in name:
        return "wine"

    # Generic salad
    if "salad" in name:
        return "salad"

    return name


def get_ingredients_from_image(image_input):
    """
    Extract ingredients from image input.
    
    Args:
        image_input: Can be a PIL Image, numpy array, or file path string
        
    Returns:
        set: A set of detected ingredient names
    """
    # Convert PIL Image to numpy array if needed (YOLO prefers numpy arrays)
    if isinstance(image_input, Image.Image):
        image_input = np.array(image_input)
    
    results = model(image_input, conf=0.1, verbose=False)[0]
    ingredients = set()

    for box in results.boxes:
        cls_id = int(box.cls)
        raw_name = model.names[cls_id]
        cls_name = normalize_label(raw_name)

        if cls_name in SKIP:
            continue

        if cls_name not in FOOD_LABELS:
            continue

        nice_name = FRIENDLY_MAP.get(cls_name, cls_name)
        ingredients.add(nice_name)

    return ingredients