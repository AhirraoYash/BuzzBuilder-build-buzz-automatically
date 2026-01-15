from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import requests
import base64
import time
import datetime
from dotenv import load_dotenv
from scraper import scrape_linkedin_posts
from database import viral_collection, history_collection

# 1. Load Keys
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
HF_KEY = os.getenv("HF_API_KEY")

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
    topic: str = "" # Optional now
    tone: str
    session_timestamp: float = 0 # The ID of the batch to analyze

# --- HELPER: IMAGE GENERATOR ---
def generate_image_from_prompt(prompt_text):
    print(f"🎨 Painting: {prompt_text[:30]}...")
    API_URL = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"
    headers = {"Authorization": f"Bearer {HF_KEY}"}
    
    try:
        response = requests.post(API_URL, headers=headers, json={"inputs": prompt_text})
        if response.status_code == 200:
            img_str = base64.b64encode(response.content).decode("utf-8")
            return f"data:image/png;base64,{img_str}"
        return None
    except:
        return None

# --- NEW ENDPOINT: GET AVAILABLE SESSIONS ---
@app.get("/sessions")
def get_harvest_sessions():
    """Groups posts by hour to create 'Sessions' for the dropdown."""
    if viral_collection is None: return []

    # Get all timestamps
    cursor = viral_collection.find({}, {"timestamp": 1, "likes": 1})
    sessions = {}

    for doc in cursor:
        ts = doc.get("timestamp", 0)
        # Group by Hour (e.g., "2024-01-15 20:00")
        dt = datetime.datetime.fromtimestamp(ts)
        key = dt.strftime("%Y-%m-%d %H:00")
        
        if key not in sessions:
            sessions[key] = {"label": key, "count": 0, "avg_likes": 0, "timestamp": ts}
        
        sessions[key]["count"] += 1
        sessions[key]["avg_likes"] += doc.get("likes", 0)

    # Convert to list and sort by new
    result = list(sessions.values())
    result.sort(key=lambda x: x["label"], reverse=True)
    return result

@app.get("/database")
def get_training_data():
    if viral_collection is None: return []
    posts = list(viral_collection.find().sort("likes", -1).limit(50))
    for post in posts: post['_id'] = str(post['_id'])
    return posts

# --- UPDATED GENERATOR ---
@app.post("/generate")
def generate_viral_post(request: PostRequest):
    
    # 1. Fetch Specific Batch Context
    context_posts = []
    
    if request.session_timestamp > 0:
        # Find posts within 1 hour of the selected session
        start_time = request.session_timestamp - 1800 # -30 mins
        end_time = request.session_timestamp + 3600   # +1 hour
        
        query = {"timestamp": {"$gte": start_time, "$lte": end_time}}
        context_posts = list(viral_collection.find(query).sort("likes", -1).limit(10))
        print(f"🧠 Focused Mode: Analyzing {len(context_posts)} posts from selected session.")
    else:
        # Fallback to global top 3
        context_posts = list(viral_collection.find().sort("likes", -1).limit(3))

    # Build Context String
    context_str = ""
    for p in context_posts:
        context_str += f"- {p['content'][:300]}... (Likes: {p.get('likes', 0)})\n"

    # 2. Construct Prompt (Auto-Topic Detection)
    topic_instruction = ""
    if request.topic:
        topic_instruction = f"Write a post specifically about: '{request.topic}'."
    else:
        topic_instruction = "Analyze the trends in the provided examples. Detect the most viral topic from them and write a new post about that topic."

    prompt = f"""
    Act as a top LinkedIn Creator.
    
    INPUT DATA (The Viral Style to Mimic):
    {context_str}
    
    TASK:
    {topic_instruction}
    Tone: {request.tone}.
    
    1. Write the Post (High engagement hooks, short lines).
    2. Write an Image Prompt (Visual description).
    
    Output Format:
    [POST]
    ... content ...
    [IMAGE]
    ... description ...
    """
    
    try:
        # Generate Text
        ai_response = model.generate_content(prompt).text
        
        post_content = ""
        image_prompt = ""
        
        if "[IMAGE]" in ai_response:
            parts = ai_response.split("[IMAGE]")
            post_content = parts[0].replace("[POST]", "").strip()
            image_prompt = parts[1].strip()
        else:
            post_content = ai_response
            image_prompt = "Abstract tech background"

        # Generate Image
        image_url = generate_image_from_prompt(image_prompt)
        
        # Save History
        if history_collection is not None:
            history_collection.insert_one({
                "topic": request.topic or "Auto-Detected",
                "content": post_content,
                "image_base64": image_url,
                "timestamp": time.time()
            })
        
        return {"content": post_content, "image": image_url}

    except Exception as e:
        return {"content": f"Error: {str(e)}", "image": None}