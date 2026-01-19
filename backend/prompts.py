def get_trend_prompt(context_str, topic_instruction, tone):
    return f"""
    Act as a World-Class LinkedIn Ghostwriter & Visual Director.
    
    CONTEXT (Viral Post Examples):
    {context_str}
    
    TASK: 
    1. Write a viral LinkedIn post based on the instruction below.
    2. Write a PROMPT for an AI Image Generator to create a stunning visual for this post.
    
    TOPIC INSTRUCTION: {topic_instruction}
    TONE: {tone}
    
    --- IMAGE RULES ---
    The image prompt must be HIGHLY DETAILED and ARTISTIC.
    Include these style keywords in the image prompt: "Cinematic lighting, 8k resolution, photorealistic, shallow depth of field, vibrant colors, professional photography, trending on ArtStation."
    Avoid generic descriptions. Make it visual and scroll-stopping.
    
    --- OUTPUT FORMAT ---
    [POST]
    (Write the text here...)
    [IMAGE]
    (Write the detailed image prompt here...)
    """

def get_remix_prompt(caption, topic, tone):
    return f"""
    Act as a Viral Content Creator & Art Director.
    
    I am providing an ORIGINAL IMAGE (visual input) and ORIGINAL CAPTION.
    
    TASK: Remix this content for a NEW TOPIC: "{topic}".
    
    STEP 1: TEXT REMIX
    Analyze the hook, sentence length, and psychological triggers of the ORIGINAL CAPTION. 
    Rewrite it completely for the "{topic}" using the same viral structure.
    Tone: {tone}.
    
    STEP 2: VISUAL REMIX
    Analyze the uploaded IMAGE (composition, lighting, subject). 
    Create a NEW IMAGE PROMPT that keeps the same "Vibe" and "Composition" but changes the subject to fit the "{topic}".
    
    IMPORTANT: Make the new image prompt "High-End". Add keywords like: "Hyper-realistic, Studio Lighting, 4k, Sharp Focus, Modern Aesthetic."
    
    ORIGINAL CAPTION: "{caption}"
    
    --- OUTPUT FORMAT ---
    [POST]
    (Write the new post here...)
    [IMAGE]
    (Write the detailed high-quality image prompt here...)
    """