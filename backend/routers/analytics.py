from fastapi import APIRouter, BackgroundTasks
from database import viral_collection, history_collection
from scraper import start_feed_harvest
from pydantic import BaseModel
import scraper_state
import datetime
import time

router = APIRouter()

# ==========================================
# 📊 DASHBOARD ANALYTICS (Real Stats)
# ==========================================
@router.get("/analytics/stats")
async def get_dashboard_stats():
    """Returns REAL counts for the Dashboard."""
    stats = {
        "total_scraped": 0,
        "total_generated": 0,
        "recent_activity": []
    }

    if viral_collection is not None:
        stats["total_scraped"] = viral_collection.count_documents({})
    
    if history_collection is not None:
        stats["total_generated"] = history_collection.count_documents({})
        
        # Get last 5 generated posts for the "Recent Activity" feed
        cursor = history_collection.find().sort("timestamp", -1).limit(5)
        for doc in cursor:
            stats["recent_activity"].append({
                "action": "Generated Post",
                "details": doc.get("topic", "Untitled Topic"),
                "time": doc.get("timestamp", time.time())
            })

    return stats

# ==========================================
# 🕷️ SCRAPER CONTROLS (Viral Database)
# ==========================================

@router.get("/sessions")
def get_harvest_sessions():
    """Groups posts by hour to create 'Sessions' for the Viral Database."""
    if viral_collection is None: return []
    
    # Fetch only necessary fields to be faster
    cursor = viral_collection.find({}, {"timestamp": 1, "likes": 1})
    sessions = {}
    
    for doc in cursor:
        ts = doc.get("timestamp", 0)
        dt = datetime.datetime.fromtimestamp(ts)
        key = dt.strftime("%Y-%m-%d %H:00") # Group by Hour
        
        if key not in sessions:
            sessions[key] = {
                "label": key, 
                "count": 0, 
                "avg_likes": 0, 
                "timestamp": ts
            }
        
        sessions[key]["count"] += 1
        sessions[key]["avg_likes"] += doc.get("likes", 0)
    
    # Sort by newest first
    result = list(sessions.values())
    result.sort(key=lambda x: x["label"], reverse=True)
    return result

@router.get("/posts-by-session")
def get_posts_by_session(timestamp: float):
    """Fetches posts from a specific time window."""
    if viral_collection is None: return []
    
    # 30 mins before to 60 mins after
    start = timestamp - 1800
    end = timestamp + 3600
    
    query = {"timestamp": {"$gte": start, "$lte": end}}
    posts = list(viral_collection.find(query).sort("likes", -1))
    
    for post in posts: 
        post['_id'] = str(post['_id'])
        
    return posts

@router.post("/trigger-scrape")
def trigger_scrape(background_tasks: BackgroundTasks):
    """Manually starts the scraper from the Frontend."""
    print("🚀 Triggering Scraper...")
    background_tasks.add_task(start_feed_harvest)
    return {"status": "started"}

@router.get("/scraper-status")
def get_scraper_status():
    """Frontend calls this every 1s to update the popup."""
    return scraper_state.state

class OTPRequest(BaseModel):
    otp: str

@router.post("/submit-otp")
def submit_otp(data: OTPRequest):
    """Frontend sends the OTP here."""
    print(f"📩 Received OTP from Frontend: {data.otp}")
    scraper_state.state["otp_input"] = data.otp
    return {"status": "received"}