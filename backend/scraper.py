from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

def scrape_linkedin_posts(hashtag, count=3):
    print("🚀 Starting Scraper (Interactive Mode)...")
    
    # 1. Setup Clean Chrome (No Profile Paths, No Conflicts)
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    
    # Anti-bot detection
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    try:
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        
        # 2. Go to Login Page
        print("🌍 Opening LinkedIn...")
        driver.get("https://www.linkedin.com/login")
        
        # 3. THE MAGIC PAUSE
        # The Python terminal will freeze here until you press ENTER
        print("\n" + "="*50)
        print("🛑 ACTION REQUIRED:")
        print("1. Look at the Chrome window.")
        print("2. Log in to LinkedIn manually.")
        print("3. Solve any captchas.")
        print("4. Once you see your Feed, come back here and PRESS ENTER.")
        print("="*50 + "\n")
        
        # This input() function pauses the script indefinitely
        # We need a way to bypass this if running from API, so we'll use a smart wait loop instead
        
        # Smart Wait Loop (Waits for you to reach the feed)
        print("⏳ Waiting for you to log in... (I am watching the URL)")
        max_wait = 120 # 2 minutes
        start_time = time.time()
        
        while True:
            try:
                if "feed" in driver.current_url:
                    print("✅ I see the Feed! Login detected.")
                    break
                if time.time() - start_time > max_wait:
                    print("❌ Timed out waiting for login.")
                    return []
                time.sleep(1)
            except:
                break

        # --- PHASE 2: SEARCH ---
        print(f"🔍 Searching for #{hashtag}...")
        driver.get(f"https://www.linkedin.com/search/results/content/?keywords={hashtag}&origin=GLOBAL_SEARCH_HEADER")
        time.sleep(5)
        
        # --- PHASE 3: EXTRACT ---
        posts_data = []
        # Try multiple selectors
        selectors = ["feed-shared-update-v2", "occludable-update", "artdeco-card"]
        
        found_elements = []
        for s in selectors:
            found = driver.find_elements(By.CLASS_NAME, s)
            if found:
                found_elements = found
                break
        
        print(f"Found {len(found_elements)} posts.")

        for i, post in enumerate(found_elements[:count]):
            try:
                text = post.text
                if len(text) < 20: continue
                
                lines = text.split('\n')
                author = lines[0] if lines else "User"
                
                posts_data.append({
                    "id": i,
                    "author": author,
                    "content": text[:200] + "...",
                    "viralityScore": 85 + i,
                    "likes": "High"
                })
            except:
                continue
                
        return posts_data

    except Exception as e:
        print(f"❌ Scraper Error: {e}")
        return []
    finally:
        # Keep browser open for a bit so you can see the result
        time.sleep(5)
        if 'driver' in locals():
            driver.quit()