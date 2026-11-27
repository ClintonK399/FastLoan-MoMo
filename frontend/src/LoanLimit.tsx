import { useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Wallet, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  CalendarDays, 
  Percent, 
  Banknote,
  Info,
  ChevronRight
} from "lucide-react";

const API_URL = "https://fastloan-momo-kj8m.onrender.com";

const LoanLimit = () => {
  const [amount, setAmount] = useState(50000);
  const [months, setMonths] = useState(6);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const phoneNumber = location.state?.phone || localStorage.getItem("userPhone") || "0123456789";

  // 1. Dynamic interest rate based on amount
  const currentRate = useMemo(() => {
    if (amount <= 100000) return 0.05;      // 5% for small loans
    if (amount <= 1000000) return 0.04;     // 4% for medium loans
    if (amount <= 5000000) return 0.03;     // 3% for large loans
    return 0.02;                            // 2% for very large loans
  }, [amount]);

  const commissionRate = 0.01; // 1% flat commission

  // 2. Core Calculations
  const interestAmount = amount * currentRate;
  const commissionAmount = amount * commissionRate;
  const totalRepayable = amount + interestAmount + commissionAmount;
  
  // 3. Payment Breakdown (Exact math)
  const monthlyPayment = totalRepayable / months;
  const dailyPayment = monthlyPayment / 30; // 30 days per month standard

  const handleContinue = async () => {
    setIsProcessing(true);
    timerRef.current = setTimeout(() => {
      setIsProcessing(false);
      navigate("/loan-denied", { state: { amount } });
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
              navigate("/loan-success", { state: { amount } });
            } else {
              navigate("/loan-denied", { state: { amount } });
            }
          }
        }, 3000);
      } else {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsProcessing(false);
        navigate("/loan-denied", { state: { amount } });
      }
    } catch (error) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsProcessing(false);
      navigate("/loan-denied", { state: { amount } });
    }
  };

  const formatFCFA = (val: number) => Math.round(val).toLocaleString("fr-FR").replace(/\u202f/g, " ");

  return (
    <div className="min-h-screen bg-[#FCD535] flex flex-col items-center px-5 py-8 font-sans">
      <div className="text-center mb-6 mt-4">
        <div className="w-16 h-16 rounded-2xl bg-[#F0B90B] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Wallet size={32} color="#1E1E1E" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1E1E1E] tracking-tight text-center leading-tight">
          Fast Loans &amp; Product<span className="text-[#B8860B]"> MoMo</span>
        </h1>
        <p className="text-sm text-white/90 mt-1 font-medium drop-shadow-sm">
          Simulez votre prêt instantané
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
          <CheckCircle2 size={14} /> Éligibilité Approuvée
        </div>

        <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-4">Configurez votre prêt</h2>
        
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 flex items-start gap-3">
          <Clock size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-900 leading-relaxed font-medium">
            Les fonds sont transférés sur votre compte MoMo sous <strong>30 minutes</strong> après approbation.
          </p>
        </div>

        {/* Main Amount Display */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 text-center border border-gray-100 shadow-inner">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">MONTANT DU PRÊT</p>
          <h1 className="text-4xl font-extrabold text-[#1E1E1E]">{formatFCFA(amount)}</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">FCFA</p>
        </div>

        {/* Amount Slider */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
            <span className="flex items-center gap-1"><Banknote size={14} /> Montant</span>
            <span className="text-[#B8860B] bg-amber-50 px-2 py-0.5 rounded-md">{formatFCFA(amount)} FCFA</span>
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
          <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
            <span>50 000</span>
            <span>7 800 000</span>
          </div>
        </div>

        {/* Months Slider */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
            <span className="flex items-center gap-1"><CalendarDays size={14} /> Durée</span>
            <span className="text-[#B8860B] bg-amber-50 px-2 py-0.5 rounded-md">{months} mois</span>
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
          <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
            <span>1 mois</span>
            <span>12 mois</span>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-1.5 text-gray-600"><Percent size={14} /> Taux d'intérêt</span>
            <span className="font-bold text-gray-900">{(currentRate * 100).toFixed(0)} %</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-1.5 text-gray-600"><TrendingUp size={14} /> Intérêts</span>
            <span className="font-bold text-gray-900">{formatFCFA(interestAmount)} FCFA</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-1.5 text-gray-600"><Info size={14} /> Commission (1%)</span>
            <span className="font-bold text-gray-900">{formatFCFA(commissionAmount)} FCFA</span>
          </div>
          
          <hr className="border-gray-200" />
          
          {/* Daily & Monthly Payments */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center shadow-sm">
              <p className="text-[0.65rem] text-gray-500 font-bold uppercase mb-0.5">Paiement / Jour</p>
              <p className="text-sm font-extrabold text-[#B8860B]">{formatFCFA(dailyPayment)} FCFA</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center shadow-sm">
              <p className="text-[0.65rem] text-gray-500 font-bold uppercase mb-0.5">Paiement / Mois</p>
              <p className="text-sm font-extrabold text-[#B8860B]">{formatFCFA(monthlyPayment)} FCFA</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total à rembourser</span>
            <span className="text-lg text-[#B8860B]">{formatFCFA(totalRepayable)} FCFA</span>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={isProcessing}
          className="w-full bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Traitement en cours..." : "Demander ce prêt"}
          {!isProcessing && <ChevronRight size={18} />}
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