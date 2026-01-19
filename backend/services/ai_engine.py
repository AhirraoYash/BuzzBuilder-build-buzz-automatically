import google.generativeai as genai
import requests
import base64
import os
import time
from dotenv import load_dotenv
from database import history_collection

load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
HF_KEY = os.getenv("HF_API_KEY")

genai.configure(api_key=GEMINI_KEY)

# --- MODELS ---
TEXT_MODEL_NAME = 'gemini-2.5-flash' 
model = genai.GenerativeModel(TEXT_MODEL_NAME)

# --- IMAGE GENERATION (Hugging Face) ---
def generate_image(prompt_text):
    print(f"🎨 Painting Image via Hugging Face: {prompt_text[:30]}...")
    API_URL = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"
    headers = {"Authorization": f"Bearer {HF_KEY}"}
    
    try:
        response = requests.post(API_URL, headers=headers, json={"inputs": prompt_text})
        if response.status_code == 200:
            img_str = base64.b64encode(response.content).decode("utf-8")
            return f"data:image/png;base64,{img_str}"
        return None
    except Exception as e:
        print(f"❌ Image Error: {e}")
        return None

# --- TEXT GENERATION ---
def generate_post_content(inputs):
    try:
        print(f"🧠 Sending to Gemini Writer ({TEXT_MODEL_NAME})...")
        ai_response = model.generate_content(inputs).text
        
        post_content = ""
        image_prompt = ""
        
        if "[IMAGE]" in ai_response:
            parts = ai_response.split("[IMAGE]")
            post_content = parts[0].replace("[POST]", "").strip()
            image_prompt = parts[1].strip()
        else:
            post_content = ai_response
            image_prompt = "Abstract tech background, cinematic lighting, 8k."

        image_url = generate_image(image_prompt)
        return post_content, image_url

    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        return f"AI Error: {str(e)}", None

# --- HISTORY SAVER ---
def save_to_history(data):
    print("💾 Attempting to save to MongoDB...")
    if history_collection is None:
        print("❌ CRITICAL: Database connection is missing! Cannot save.")
        return

    try:
        data["timestamp"] = time.time()
        result = history_collection.insert_one(data)
        print(f"✅ SUCCESS: Saved to History! (ID: {result.inserted_id})")
        return str(result.inserted_id)
    except Exception as e:
        print(f"❌ Database Save Failed: {e}")