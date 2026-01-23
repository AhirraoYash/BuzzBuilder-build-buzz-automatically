from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import random
import os
from database import save_scraped_posts_to_db
# Load variables at the top of the file
load_dotenv()



# --- FUNCTION 1: API MODE (Search Hashtags) ---
def scrape_linkedin_posts(hashtag, count=5):
    print(f"🚀 API Scraper: Searching for #{hashtag}...")
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        driver.get("https://www.linkedin.com/login")
        print("🛑 Log in quickly if needed!")
        time.sleep(15) 
        driver.get(f"https://www.linkedin.com/search/results/content/?keywords={hashtag}&origin=GLOBAL_SEARCH_HEADER")
        time.sleep(5)
        
        posts_data = []
        cards = driver.find_elements(By.CLASS_NAME, "feed-shared-update-v2")
        
        for i, card in enumerate(cards[:count]):
            try:
                text = card.text
                if len(text) < 20: continue
                posts_data.append({
                    "id": i,
                    "author": "LinkedIn User",
                    "content": text[:200] + "...",
                    "likes": "High"
                })
            except: continue
        return posts_data
    except Exception as e:
        print(f"❌ Error: {e}")
        return []
    finally:
        driver.quit()

# --- FUNCTION 2: HARVEST MODE (Robust Version) ---
def start_feed_harvest():
    TARGET_POSTS = 100
    print(f"🚜 Starting Harvest -> MongoDB... Target: {TARGET_POSTS} posts")
    
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        print("🌍 Opening LinkedIn...")
        driver.get("https://www.linkedin.com/login")
        print("\n🛑 ACTION REQUIRED: Log in manually. Press ENTER in terminal when you see your Feed.")
        input() 
        
        print("✅ Starting scroll...")
        
        collected_count = 0
        scroll_stuck_count = 0
        last_height = driver.execute_script("return document.body.scrollHeight")

        while collected_count < TARGET_POSTS:
            # 1. Try Multiple Selectors to find posts
            cards = driver.find_elements(By.CLASS_NAME, "feed-shared-update-v2")
            if not cards:
                cards = driver.find_elements(By.TAG_NAME, "article") # Backup selector
            
            print(f"👀 I see {len(cards)} posts on screen...")

            batch = []
            for card in cards:
                try:
                    text = card.text
                    if len(text) < 50: continue # Skip short/empty posts
                    
                    # 2. Robust Like Extraction
                    likes = 0
                    try:
                        # Strategy A: Standard Social Count
                        raw_block = card.find_element(By.CSS_SELECTOR, ".social-details-social-counts").text
                        likes = int(''.join(filter(str.isdigit, raw_block)))
                    except:
                        # Strategy B: Reaction Text (e.g., "100 comments")
                        try:
                            raw_text = card.text
                            # Simple heuristic: Look for numbers near the bottom
                            lines = raw_text.split('\n')
                            for line in lines[-5:]: # Check last 5 lines
                                if "reaction" in line or "comment" in line:
                                    nums = [int(s) for s in line.split() if s.isdigit()]
                                    if nums: likes = max(nums)
                        except:
                            likes = 0 # Failed to find likes

                    # 3. SAVE EVEN IF LIKES ARE 0 (We filter later)
                    # We default to 10 likes if 0, just so we save the training text
                    final_likes = likes if likes > 0 else 10 

                    batch.append({
                        "content": text,
                        "likes": final_likes,
                        "source": "Home Feed",
                        "timestamp": time.time()
                    })
                except Exception as e:
                    # print(f"⚠️ skipped a post: {e}")
                    continue
            
            # Save Batch
            if batch:
                save_scraped_posts_to_db(batch)
                collected_count += len(batch)
                print(f"💾 Saved batch of {len(batch)}. Total: {collected_count}/{TARGET_POSTS}")
            else:
                print("⚠️ No valid posts found in this scroll.")
            
            # Scroll & Sleep
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(random.uniform(3, 6))
            
            # Stickiness Check
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                scroll_stuck_count += 1
                if scroll_stuck_count > 3:
                    print("⚠️ End of Feed reached.")
                    break
            else:
                scroll_stuck_count = 0
            last_height = new_height

        print("🎉 Harvest Complete!")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    start_feed_harvest()

