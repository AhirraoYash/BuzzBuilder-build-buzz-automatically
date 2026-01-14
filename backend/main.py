from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from scraper import scrape_linkedin_posts

# 1. Load the environment variables
load_dotenv()

# 2. Get the key safely
API_KEY = os.getenv("GEMINI_API_KEY")

# Check if key is missing (Good for debugging)
if not API_KEY:
    print("❌ ERROR: API Key not found! Check your .env file.")
else:
    print("✅ API Key loaded successfully.")
    genai.configure(api_key=API_KEY)
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

@app.get("/")
def read_root():
    return {"status": "Gemini AI is Online 🧠"}

@app.post("/generate")
def generate_viral_post(request: PostRequest):
    if not API_KEY:
        return {"content": "Error: Server missing API Key."}

    print(f"Thinking about: {request.topic}...")
    
    prompt = f"""
    Act as a expert LinkedIn Ghostwriter with 1M+ followers.
    Write a viral LinkedIn post about: "{request.topic}".
    
    Tone: {request.tone}.
    
    Rules:
    1. Start with a scroll-stopping "Hook" (first line).
    2. Use short, punchy sentences.
    3. Use bullet points or numbers for readability.
    4. End with a specific call to action (question).
    5. Include 3-4 relevant hashtags at the bottom.
    6. Do not include phrases like "Here is a post" or headers. Just give me the post content.
    """
    
    try:
        response = model.generate_content(prompt)
        return {"content": response.text}
    except Exception as e:
        return {"content": f"AI Error: {str(e)}"}
    
@app.get("/analyze")
def analyze_trends(hashtag: str):
    print(f"🕵️‍♀️ Scraping LinkedIn for: {hashtag}")
    posts = scrape_linkedin_posts(hashtag, count=3)

    if not posts:
        return {"status": "error", "message": "Failed to scrape or no posts found."}

    return {"status": "success", "posts": posts}

def get_viral_context():
    if not os.path.exists("viral_dataset.json"):
        return ""
    
    with open("viral_dataset.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Sort by Likes (Highest first) - This is the "Training" logic
    # We filter for posts with numbers to avoid errors
    valid_posts = [p for p in data if isinstance(p.get('likes'), int)]
    sorted_posts = sorted(valid_posts, key=lambda x: x['likes'], reverse=True)
    
    # Get Top 3 Best Posts
    top_posts = sorted_posts[:3]
    
    context_string = "Here are examples of HIGH VIRALITY posts. Mimic this style:\n\n"
    for p in top_posts:
        context_string += f"EXAMPLE:\n{p['content'][:300]}...\n\n"
        
    return context_string

@app.post("/generate")
def generate_viral_post(request: PostRequest):
    # 1. Get "Training" Context
    viral_examples = get_viral_context()
    
    print(f"🧠 Generating using context from {len(viral_examples)} chars of training data...")

    prompt = f"""
    Act as a expert LinkedIn Ghostwriter.
    
    {viral_examples}
    
    TASK: Write a new viral post about: "{request.topic}".
    TONE: {request.tone}.
    
    Generate 2 things:
    1. The Post Text.
    2. An IMAGE PROMPT that describes a viral image to match this post.
    
    Format:
    [POST]
    ... content ...
    [IMAGE PROMPT]
    ... description ...
    """
    
    try:
        response = model.generate_content(prompt)
        return {"content": response.text}
    except Exception as e:
        return {"content": f"AI Error: {str(e)}"}