from pymongo import MongoClient
import os
from dotenv import load_dotenv

# 1. Load the .env file
load_dotenv()

# 2. Get the Connection String safely
# If MONGO_URI is missing in .env, it defaults to localhost
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "scraping"

def get_database():
    """Establishes connection to MongoDB using the .env credentials."""
    try:
        print(f"🔌 Connecting to MongoDB at: {MONGO_URI} ...")
        client = MongoClient(MONGO_URI)
        
        # Ping to verify connection is alive
        client.admin.command('ping')
        print(f"✅ MongoDB Connected Successfully to: {DB_NAME}")
        return client[DB_NAME]
    except Exception as e:
        print(f"❌ MongoDB Connection Failed: {e}")
        return None

# 3. Initialize Database
db = get_database()

# 4. Export Collections
if db is not None:
    viral_collection = db["viral_posts"]
    history_collection = db["generated_history"]
else:
    # Safety fallback to prevent crashes if DB is down
    viral_collection = None
    history_collection = None

# 5. Helper: Save Unique Posts
def save_scraped_posts_to_db(posts):
    if db is None or not posts:
        return

    count = 0
    for post in posts:
        # Check for duplicates using content
        exists = viral_collection.find_one({"content": post["content"]})
        
        if not exists:
            viral_collection.insert_one(post)
            count += 1
            
    if count > 0:
        print(f"💾 MongoDB: Saved {count} new unique posts.")