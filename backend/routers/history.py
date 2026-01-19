from fastapi import APIRouter, HTTPException
from database import history_collection
from bson import ObjectId
import logging

# Create the router
router = APIRouter()

# --- 1. GET ALL HISTORY ---
@router.get("/history")
def get_history():
    """Fetches all saved posts from the database."""
    if history_collection is None:
        return [] # Return empty list if DB is down
    
    try:
        # Fetch all documents, sort by time (newest first)
        posts = list(history_collection.find().sort("timestamp", -1))
        
        # Convert ObjectId to string for JSON compatibility
        for post in posts:
            post["_id"] = str(post["_id"])
            
        return posts
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

# --- 2. DELETE A POST ---
@router.delete("/history/{post_id}")
def delete_post(post_id: str):
    """Deletes a specific post by ID."""
    if history_collection is None:
        raise HTTPException(status_code=503, detail="Database disconnected")

    try:
        # Convert string ID to MongoDB ObjectId
        obj_id = ObjectId(post_id)
        
        # Delete the document
        result = history_collection.delete_one({"_id": obj_id})
        
        if result.deleted_count == 1:
            return {"status": "success", "message": "Post deleted"}
        else:
            raise HTTPException(status_code=404, detail="Post not found")
            
    except Exception as e:
        print(f"Error deleting post: {e}")
        raise HTTPException(status_code=500, detail=str(e))