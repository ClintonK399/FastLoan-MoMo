import { useNavigate, useLocation } from "react-router-dom";
import { XCircle, CreditCard, ShieldCheck } from "lucide-react";

const LoanDenied = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loanAmount = location.state?.amount || 50000;

  // Dynamic deposit requirement based on requested amount
  const getMinimumDeposit = (amount: number) => {
    if (amount <= 50000) return 5000;
    if (amount <= 100000) return 10000;
    if (amount <= 500000) return 35000;
    if (amount <= 1000000) return 50000;
    return 70000;
  };

  const minDeposit = getMinimumDeposit(loanAmount);
  const formatFCFA = (val: number) => Math.round(val).toLocaleString("fr-FR").replace(/\u202f/g, " ");

  return (
    <div className="min-h-screen bg-[#FCD535] flex flex-col items-center justify-center px-5 py-8 font-sans relative overflow-hidden">
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center relative z-10 animate-[popIn_0.3s_ease-out]">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
          <XCircle size={48} className="text-red-500" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-3">Demande Refusée</h2>
        
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-800 font-medium leading-relaxed">
            Désolé, nous ne pouvons pas approuver votre prêt de <strong>{formatFCFA(loanAmount)} FCFA</strong> pour le moment.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8 text-left">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pour débloquer ce prêt</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Dépôt de garantie requis</span>
            <span className="text-lg font-extrabold text-red-600">{formatFCFA(minDeposit)} FCFA</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Déposez ce montant sur votre compte MTN MoMo pour augmenter votre limite de crédit.</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ShieldCheck size={18} /> J'ai effectué le dépôt
          </button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
            <CreditCard size={14} />
            <span>Le système vérifiera votre dépôt automatiquement</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoanDenied;