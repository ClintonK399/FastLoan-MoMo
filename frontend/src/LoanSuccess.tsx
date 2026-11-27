import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, CheckCircle2, Clock, Banknote } from "lucide-react";

const LoanSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loanAmount = location.state?.amount || 50000;

  const formatFCFA = (val: number) => Math.round(val).toLocaleString("fr-FR").replace(/\u202f/g, " ");

  return (
    <div className="min-h-screen bg-[#FCD535] flex flex-col items-center px-5 py-8 font-sans">
      <div className="text-center mb-8 mt-4">
        <div className="w-16 h-16 rounded-2xl bg-[#F0B90B] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Wallet size={32} color="#1E1E1E" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1E1E1E] tracking-tight">
          Fast Product<span className="text-[#B8860B]">MoMo</span>
        </h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-emerald-100">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-2">Prêt Approuvé !</h2>
        <p className="text-sm text-gray-500 mb-6">Votre demande de prêt a été acceptée avec succès.</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Montant accordé</span>
          <span className="text-lg font-extrabold text-[#B8860B]">{formatFCFA(loanAmount)} FCFA</span>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3 text-left">
          <Clock size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-900 leading-relaxed font-medium">
            Les fonds seront directement transférés sur votre portefeuille mobile dans un délai maximum de <strong>30 minutes</strong>. Vous recevrez une notification par SMS dès réception.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/shop")}
            className="w-full bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Banknote size={18} /> Continuer mes achats
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanSuccess;