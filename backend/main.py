from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import requests
import base64
import time
from dotenv import load_dotenv

# --- IMPORTS FROM YOUR OTHER FILES ---
from scraper import scrape_linkedin_posts
from database import viral_collection, history_collection

# 1. Load Keys
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
HF_KEY = os.getenv("HF_API_KEY")

# 2. Configure Gemini
if not GEMINI_KEY:
    print("❌ ERROR: GEMINI_API_KEY missing in .env")
genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PostRequest(BaseModel):
    topic: str
    tone: str

# --- HELPER 1: IMAGE GENERATOR (Hugging Face) ---
def generate_image_from_prompt(prompt_text):
    print(f"🎨 Painting image for: {prompt_text[:30]}...")
    API_URL = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"
    headers = {"Authorization": f"Bearer {HF_KEY}"}
    
    try:
        response = requests.post(API_URL, headers=headers, json={"inputs": prompt_text})
        if response.status_code == 200:
            # Convert binary image to Base64 string so React can show it
            img_str = base64.b64encode(response.content).decode("utf-8")
            return f"data:image/png;base64,{img_str}"
        else:
            print(f"❌ HF Error: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Image Gen Failed: {e}")
        return None

# --- HELPER 2: GET TRAINING DATA FROM MONGODB ---
def get_viral_context():
    """Fetches top 3 liked posts from MongoDB to train the AI."""
    try:
        if viral_collection is None:
            return ""

        # Query: Sort by likes descending, limit 3
        top_posts = list(viral_collection.find().sort("likes", -1).limit(3))
        
        if not top_posts:
            print("⚠️ MongoDB: No training data found yet.")
            return ""

        print(f"🧠 MongoDB: Loaded {len(top_posts)} top viral posts for context.")
        
        context_string = "Here are 3 examples of REAL viral posts. Mimic their style:\n\n"
        for i, p in enumerate(top_posts):
            context_string += f"--- EXAMPLE {i+1} ---\n{p['content'][:400]}...\n\n"
            
        return context_string
    except Exception as e:
        print(f"⚠️ DB Error: {e}")
        return ""

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"status": "VaxTrack Viral Engine (MongoDB Edition) 🚀"}

@app.get("/analyze")
def analyze_trends(hashtag: str):
    print(f"🕵️‍♀️ Scraping LinkedIn for: {hashtag}")
    # This calls the function from scraper.py
    posts = scrape_linkedin_posts(hashtag, count=5)
    return {"status": "success", "posts": posts}

@app.post("/generate")
def generate_viral_post(request: PostRequest):
    # 1. Get Context from DB
    viral_examples = get_viral_context()
    
    print(f"🧠 Thinking about: {request.topic}...")
    
    prompt = f"""
    Act as a expert LinkedIn Ghostwriter.
    {viral_examples}
    
    TASK: Write a new viral post about: "{request.topic}".
    TONE: {request.tone}.
    
    Output strictly in this format:
    [POST]
    (Content)
    [IMAGE]
    (Visual Description)
    """
    
    try:
        # A. Generate Text
        ai_response = model.generate_content(prompt).text
        
        post_content = ""
        image_prompt = ""
        
        if "[IMAGE]" in ai_response:
            parts = ai_response.split("[IMAGE]")
            post_content = parts[0].replace("[POST]", "").strip()
            image_prompt = parts[1].strip()
        else:
            post_content = ai_response
            image_prompt = f"Abstract modern tech representation of {request.topic}"

        # B. Generate Image
        image_url = generate_image_from_prompt(image_prompt)
        
        # C. SAVE TO MONGODB (The "History" Feature)
        if history_collection is not None:
            new_record = {
                "topic": request.topic,
                "tone": request.tone,
                "content": post_content,
                "image_prompt": image_prompt,
                "image_base64": image_url, # Storing the image string
                "timestamp": time.time()
            }
            history_collection.insert_one(new_record)
            print("💾 Saved generated result to MongoDB History!")
        
        return {
            "content": post_content,
            "image": image_url 
        }

    except Exception as e:
        return {"content": f"AI Error: {str(e)}", "image": None}

@app.get("/database")
def get_training_data():
    """Fetches the top 50 viral posts stored in MongoDB."""
    try:
        if viral_collection is None:
            return []

        # Get top 50 posts, sorted by Likes (Highest first)
        posts_cursor = viral_collection.find().sort("likes", -1).limit(50)
        posts = list(posts_cursor)

        # Fix MongoDB ObjectId (it breaks JSON if not converted to string)
        for post in posts:
            post['_id'] = str(post['_id'])
            
        print(f"📂 Sent {len(posts)} archived posts to frontend.")
        return posts
    except Exception as e:
        print(f"❌ Database Fetch Error: {e}")
        return []