from pymongo import MongoClient
import os
import ssl
import sys
import certifi
from dotenv import load_dotenv

# 1. Load Environment
load_dotenv()
uri = os.getenv("MONGO_URI")

print("\n=================================================")
print(f"🕵️  MONGO DB CONNECTION DIAGNOSTIC")
print("=================================================")
print(f"🐍 Python Version:  {sys.version.split()[0]}")
try:
    import pymongo
    print(f"📦 PyMongo Version: {pymongo.version}")
except:
    print("📦 PyMongo Version: Not Found")

if not uri:
    print("❌ ERROR: MONGO_URI is missing from .env file!")
    exit()

print(f"🎯 Target Database: {uri[:30]}...")
print("=================================================\n")

# --- TEST 1: STANDARD (Production Style) ---
print("👉 [TEST 1] Standard Secure Connection...")
try:
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ SUCCESS! Standard connection works.")
    exit()
except Exception as e:
    print(f"❌ Failed: {str(e)[:100]}...")

# --- TEST 2: BYPASS (Insecure Flag) ---
print("\n👉 [TEST 2] Insecure Flag (tlsAllowInvalidCertificates)...")
try:
    client = MongoClient(uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ SUCCESS! Insecure connection works.")
    exit()
except Exception as e:
    print(f"❌ Failed: {str(e)[:100]}...")

# --- TEST 3: MANUAL SSL CONTEXT (Python 3.14 Bypass) ---
print("\n👉 [TEST 3] Manual SSL Context Construction...")
try:
    # Build a raw SSL context that ignores everything
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    # Pass it to MongoClient (Note: We use the 'uuidRepresentation' just to ensure valid options)
    client = MongoClient(uri, tls=True, ssl_context=ctx, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ SUCCESS! Manual SSL Context works.")
    exit()
except Exception as e:
    print(f"❌ Failed: {str(e)[:100]}...")

print("\n=================================================")
print("🛑 CONCLUSION: NETWORK OR PYTHON FAILURE")
print("=================================================")
print("If ALL 3 tests failed, the problem is 100% your ENVIRONMENT.")
print("1. Your WiFi is blocking Port 27017 (Try a Phone Hotspot).")
print("2. Your IP is blocked in MongoDB Atlas (Check Network Access).")
print("3. Python 3.14 is incompatible (Install Python 3.12).")