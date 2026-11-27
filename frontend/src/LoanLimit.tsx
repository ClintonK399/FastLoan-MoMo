import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, CheckCircle2, Clock } from "lucide-react";

const API_URL = "https://fastloan-momo-kj8m.onrender.com";

const LoanLimit = () => {
  const [amount, setAmount] = useState(50000);
  const [months, setMonths] = useState(6);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const phoneNumber = location.state?.phone || localStorage.getItem("userPhone") || "0123456789";

  // Dynamic interest rate
  const getInterestRate = (amt: number) => {
    if (amt <= 100000) return 0.05;
    if (amt <= 1000000) return 0.04;
    if (amt <= 10000000) return 0.03;
    return 0.02;
  };

  const currentRate = getInterestRate(amount);
  const interestAmount = amount * currentRate;
  const totalRepayable = amount + interestAmount;
  const monthlyPayment = totalRepayable / months;

  const handleContinue = async () => {
    setIsProcessing(true);
    timerRef.current = setTimeout(() => {
      setIsProcessing(false);
      navigate("/loan-denied", { state: { amount: amount } });
    }, 60000);

    try {
      const res = await fetch(`${API_URL}/api/apply-loan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber, amount, months }),
      });
      const data = await res.json();

      if (data.status === "pending" && data.loan_id) {
        const pollInterval = setInterval(async () => {
          const statusRes = await fetch(`${API_URL}/api/loan-status/${data.loan_id}`);
          const statusData = await statusRes.json();

          if (statusData.status !== "pending") {
            clearInterval(pollInterval);
            if (timerRef.current) clearTimeout(timerRef.current);
            setIsProcessing(false);
            
            if (statusData.status === "approved") {
              navigate("/loan-success", { state: { amount: amount } });
            } else {
              navigate("/loan-denied", { state: { amount: amount } });
            }
          }
        }, 3000);
      } else {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsProcessing(false);
        navigate("/loan-denied", { state: { amount: amount } });
      }
    } catch (error) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsProcessing(false);
      navigate("/loan-denied", { state: { amount: amount } });
    }
  };

  const formatFCFA = (val: number) => {
    return Math.round(val).toLocaleString("fr-FR").replace(/\u202f/g, " ");
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
          Prêts mobiles instantanés
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
          <CheckCircle2 size={14} /> Approuvé
        </div>

        <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-4">Votre limite de prêt</h2>
        
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Clock size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-900 leading-relaxed font-medium">
            Votre prêt sera directement transféré sur votre portefeuille mobile dès son approbation, ce qui prend généralement environ <strong>30 minutes</strong>.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-center border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">MONTANT DU PRÊT</p>
          <h1 className="text-4xl font-extrabold text-[#1E1E1E]">{formatFCFA(amount)}</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">FCFA</p>
        </div>

        {/* Amount Slider */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
            <span>Montant</span>
            <span className="text-[#B8860B]">{formatFCFA(amount)} FCFA</span>
          </div>
          <input
            type="range"
            min="50000"
            max="7800000"
            step="10000"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F0B90B]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>50 000</span>
            <span>7 800 000</span>
          </div>
        </div>

        {/* Months Slider */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
            <span>Période</span>
            <span className="text-[#B8860B]">{months} mois</span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F0B90B]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 mois</span>
            <span>12 mois</span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Taux d'intérêt</span>
            <span className="font-bold text-gray-900">{(currentRate * 100).toFixed(0)} %</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Intérêts</span>
            <span className="font-bold text-gray-900">{formatFCFA(interestAmount)} FCFA</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Paiement mensuel</span>
            <span className="font-bold text-gray-900">{formatFCFA(monthlyPayment)} FCFA</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-1">
            <span>Total à rembourser</span>
            <span className="text-[#B8860B]">{formatFCFA(totalRepayable)} FCFA</span>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={isProcessing}
          className="w-full bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] font-bold py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Traitement en cours..." : "Demander ce prêt"}
        </button>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-5">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-5 rounded-full border-4 border-gray-100 border-t-[#F0B90B] animate-spin" />
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-2">Demande soumise</h3>
            <p className="text-sm text-gray-500">Veuillez patienter pendant que nous examinons votre demande...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanLimit;