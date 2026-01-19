from fastapi import APIRouter
from models import PostRequest
from database import viral_collection
# Import the save function
from services.ai_engine import generate_post_content, save_to_history 
from prompts import get_trend_prompt, get_remix_prompt
import base64
import io
from PIL import Image

router = APIRouter()

@router.post("/generate")
def generate_viral_post(request: PostRequest):
    
    gemini_inputs = []
    
    # === MODE 1: TREND ANALYSIS ===
    if request.mode == "trend":
        # 1. Fetch Context from DB
        context_posts = []
        if request.session_timestamp > 0:
            start_time = request.session_timestamp - 1800
            end_time = request.session_timestamp + 3600
            query = {"timestamp": {"$gte": start_time, "$lte": end_time}}
            context_posts = list(viral_collection.find(query).sort("likes", -1).limit(10))
        else:
            context_posts = list(viral_collection.find().sort("likes", -1).limit(3))

        context_str = "\n".join([f"- {p['content'][:300]}..." for p in context_posts])
        topic_instruction = f"Write about: '{request.topic}'." if request.topic else "Detect viral topic."

        # 2. Get Prompt
        prompt_text = get_trend_prompt(context_str, topic_instruction, request.tone)
        gemini_inputs = [prompt_text]

    # === MODE 2: REMIX MODE ===
    elif request.mode == "remix":
        # 1. Process Image
        if request.reference_image_base64:
            try:
                base64_data = request.reference_image_base64.split(",")[1]
                image_bytes = base64.b64decode(base64_data)
                img_pil = Image.open(io.BytesIO(image_bytes))
                gemini_inputs.append(img_pil) 
            except Exception as e:
                print(f"⚠️ Image processing failed: {e}")

        # 2. Get Prompt
        prompt_text = get_remix_prompt(request.reference_caption, request.topic, request.tone)
        gemini_inputs.insert(0, prompt_text) 

    # === 3. EXECUTE AI ===
    content, image_url = generate_post_content(gemini_inputs)
    
    # === 4. SAVE TO DATABASE (The Missing Link) ===
    save_to_history({
        "mode": request.mode,
        "topic": request.topic,
        "content": content,
        "image_base64": image_url # Note: This stores the image string directly
    })
    
    return {"content": content, "image": image_url}