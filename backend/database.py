from pymongo import MongoClient
import os
import certifi
from dotenv import load_dotenv
import datetime
import time

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = None
db = None
viral_collection = None
history_collection = None

# --- CONNECT TO CLOUD DATABASE (Standard & Secure) ---
try:
    print(f"🔌 Connecting to MongoDB Atlas...")
    
    # We use the standard secure method now because your environment is fixed!
    client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
    client.admin.command('ping')
    
    db = client["scraping"]
    viral_collection = db["viral_posts"]
    history_collection = db["generated_history"]
    print("✅ MongoDB Atlas Connected Successfully!")

except Exception as e:
    print(f"❌ Connection Failed: {e}")
    # We don't need a fallback anymore because we know it works!

# --- SAVE FUNCTION (Crucial for Scraper) ---
def save_scraped_posts_to_db(posts):
    if viral_collection is None:
        print("⚠️ Database Disconnected. Cannot save.")
        return

    if not posts: return

    new_count = 0
    try:
        for post in posts:
            # Check for duplicates so we don't save the same post twice
            exists = viral_collection.find_one({"content": post["content"]})
            if not exists:
                post["scraped_at"] = datetime.datetime.now()
                # Ensure every post has a timestamp
                if "timestamp" not in post: 
                    post["timestamp"] = time.time()
                
                viral_collection.insert_one(post)
                new_count += 1
                
        print(f"💾 Saved {new_count} new posts to Atlas Cloud DB.")
        
    except Exception as e:
        print(f"❌ Error Saving: {e}")