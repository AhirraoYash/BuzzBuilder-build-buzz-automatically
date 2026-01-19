from fastapi import APIRouter, BackgroundTasks
from database import viral_collection, history_collection 
import datetime
from scraper import start_feed_harvest

router = APIRouter()

@router.get("/sessions")
def get_harvest_sessions():
    """Groups posts by hour to create 'Sessions'."""
    if viral_collection is None: return []
    cursor = viral_collection.find({}, {"timestamp": 1, "likes": 1})
    sessions = {}
    for doc in cursor:
        ts = doc.get("timestamp", 0)
        dt = datetime.datetime.fromtimestamp(ts)
        key = dt.strftime("%Y-%m-%d %H:00")
        if key not in sessions:
            sessions[key] = {"label": key, "count": 0, "avg_likes": 0, "timestamp": ts}
        sessions[key]["count"] += 1
        sessions[key]["avg_likes"] += doc.get("likes", 0)
    
    result = list(sessions.values())
    result.sort(key=lambda x: x["label"], reverse=True)
    return result

@router.get("/posts-by-session")
def get_posts_by_session(timestamp: float):
    if viral_collection is None: return []
    start = timestamp - 1800
    end = timestamp + 3600
    query = {"timestamp": {"$gte": start, "$lte": end}}
    posts = list(viral_collection.find(query).sort("likes", -1))
    for post in posts: post['_id'] = str(post['_id'])
    return posts

@router.post("/trigger-scrape")
def trigger_scrape(background_tasks: BackgroundTasks):
    print("🚀 Triggering Scraper...")
    background_tasks.add_task(start_feed_harvest)
    return {"status": "started"}

@router.get("/history")
def get_generated_history():
    """Returns the last 20 posts YOU created."""
    if history_collection is None: return []
    posts = list(history_collection.find().sort("timestamp", -1).limit(20))
    for post in posts: post['_id'] = str(post['_id'])
    return posts