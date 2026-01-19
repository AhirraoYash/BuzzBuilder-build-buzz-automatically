from pydantic import BaseModel

class PostRequest(BaseModel):
    mode: str = "trend"       # 'trend' or 'remix'
    topic: str = ""
    tone: str = "Professional"
    session_timestamp: float = 0
    
    # Remix Fields
    reference_caption: str = ""
    reference_image_base64: str = ""