# backend/scraper_state.py

# This dictionary holds the live status of the scraper
state = {
    "status": "IDLE",       # Options: IDLE, RUNNING, WAITING_FOR_OTP, COMPLETED, ERROR
    "message": "Ready",     # Status text (e.g., "Logging in...")
    "otp_input": None,      # Where we store the OTP sent from Frontend
    "logs": []              # To show a mini-log in the popup
}

def set_status(status, message=None):
    state["status"] = status
    if message:
        state["message"] = message
        state["logs"].append(message)
        # Keep logs short (last 10 lines)
        if len(state["logs"]) > 10:
            state["logs"].pop(0)

def reset_state():
    state["status"] = "IDLE"
    state["message"] = "Ready"
    state["otp_input"] = None
    state["logs"] = []