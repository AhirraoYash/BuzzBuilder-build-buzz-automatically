from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys # <--- New Import
from webdriver_manager.chrome import ChromeDriverManager
import time
import random
import os
from dotenv import load_dotenv
from database import save_scraped_posts_to_db
import scraper_state

load_dotenv()

# --- LOGIN FUNCTION (Unchanged) ---
def login_to_linkedin(driver):
    scraper_state.set_status("RUNNING", "🔑 Attempting Login...")
    driver.get("https://www.linkedin.com/login")
    
    email = os.getenv("LINKEDIN_EMAIL")
    password = os.getenv("LINKEDIN_PASSWORD")

    if not email: 
        scraper_state.set_status("ERROR", "Missing Email in .env")
        return False
        
    try:
        driver.find_element(By.ID, "username").send_keys(email)
        driver.find_element(By.ID, "password").send_keys(password)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        scraper_state.set_status("RUNNING", "🕵️ Checking for Security Challenge...")
        
        try:
            WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.ID, "input__email_verification_pin")))
            scraper_state.set_status("WAITING_FOR_OTP", "LinkedIn asked for OTP. Please enter it.")
            
            while scraper_state.state["otp_input"] is None:
                time.sleep(1)
                try: driver.title 
                except: return False
            
            otp_code = scraper_state.state["otp_input"]
            driver.find_element(By.ID, "input__email_verification_pin").send_keys(otp_code)
            driver.find_element(By.ID, "email-pin-submit-button").click()
            scraper_state.state["otp_input"] = None 
            
        except TimeoutException:
            scraper_state.set_status("RUNNING", "✅ No OTP asked.")

        WebDriverWait(driver, 15).until(EC.url_contains("feed"))
        scraper_state.set_status("RUNNING", "✅ Login Successful!")
        return True

    except Exception as e:
        scraper_state.set_status("ERROR", f"Login Failed: {str(e)}")
        return False

# --- MAIN HARVEST FUNCTION (Visual Locator Mode) ---
# ... (Keep imports and login function exactly as they are) ...

# --- MAIN HARVEST FUNCTION (The "Button-Up" Strategy) ---
def start_feed_harvest(headless_mode=False):
    TARGET_POSTS = 50 
    scraper_state.reset_state()
    scraper_state.set_status("RUNNING", "🚀 Starting Chrome...")
    
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-notifications")
    if headless_mode:
        options.add_argument("--headless")
        options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        if not login_to_linkedin(driver):
            return

        scraper_state.set_status("RUNNING", "🚜 Loading Feed...")
        driver.get("https://www.linkedin.com/feed/")
        
        # 1. Wait for page body
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(5) 

        collected_count = 0
        scroll_stuck_count = 0
        seen_hashes = set()
        body_elem = driver.find_element(By.TAG_NAME, "body")

        while collected_count < TARGET_POSTS:
            scraper_state.set_status("RUNNING", f"👀 Scanning... ({collected_count}/{TARGET_POSTS})")
            
            # --- THE FIX: ANCHOR SEARCH ---
            # Instead of looking for a "Post Box", we look for the "Like" or "Comment" buttons.
            # This is robust because these words MUST exist on the screen.
            anchors = driver.find_elements(By.XPATH, "//*[text()='Comment' or text()='Like' or contains(@aria-label, 'Comment') or contains(@aria-label, 'Like')]")
            
            batch = []
            
            for anchor in anchors:
                try:
                    # 2. Walk UP the tree to find the container
                    # We look for the nearest parent <div> that has more than 100 characters of text
                    parent = anchor.find_element(By.XPATH, "./ancestor::div[string-length(.) > 100][1]")
                    
                    # Scroll to it to ensure text is rendered
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", parent)
                    
                    text = parent.text
                    # Clean up: Remove the "Like Comment Share" text itself
                    clean_text = text.split("Comment")[0].strip()
                    
                    if len(clean_text) < 40: continue 
                    
                    # Deduplicate
                    h = hash(clean_text[:50])
                    if h in seen_hashes: continue
                    seen_hashes.add(h)
                    
                    # Extract Likes (heuristic)
                    likes = 5
                    try:
                        import re
                        # Find all numbers in the text block
                        nums = [int(n) for n in re.findall(r'\d+', text) if int(n) < 100000]
                        if nums: likes = max(nums)
                    except: pass

                    batch.append({
                        "content": clean_text,
                        "likes": likes,
                        "source": "Home Feed",
                        "timestamp": time.time()
                    })
                except:
                    continue 
            
            # Save Batch
            if batch:
                save_scraped_posts_to_db(batch)
                collected_count += len(batch)
                scraper_state.set_status("RUNNING", f"💾 Saved {len(batch)} new posts. Total: {collected_count}")
                scroll_stuck_count = 0
            else:
                scroll_stuck_count += 1
            
            # --- SCROLLING ---
            # Press Page Down twice (Simulates Human Reading)
            body_elem.send_keys(Keys.PAGE_DOWN)
            time.sleep(1.5)
            body_elem.send_keys(Keys.PAGE_DOWN)
            time.sleep(2)
            
            if scroll_stuck_count > 6:
                scraper_state.set_status("RUNNING", "🔄 Stuck. Refreshing page...")
                driver.refresh()
                time.sleep(5)
                body_elem = driver.find_element(By.TAG_NAME, "body")
                scroll_stuck_count = 0

        scraper_state.set_status("COMPLETED", f"Harvest Complete! Collected {collected_count} posts.")

    except Exception as e:
        scraper_state.set_status("ERROR", f"Error: {str(e)}")
    finally:
        driver.quit()