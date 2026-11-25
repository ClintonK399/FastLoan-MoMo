import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, CreditCard, Wallet } from "lucide-react";

const OrderDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FCD535] flex flex-col items-center justify-center px-5 py-8 font-sans relative overflow-hidden">
      
      {/* Background Blur */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

      {/* POPUP MODAL */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center relative z-10 animate-[popIn_0.3s_ease-out]">
        
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
          <XCircle size={48} className="text-red-500" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-3">Transaction Échouée</h2>
        
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-800 font-medium leading-relaxed">
            Désolé, votre compte MoMo ne dispose pas de <strong>fonds suffisants</strong> pour finaliser cette commande.
          </p>
        </div>

        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <CreditCard size={18} className="text-gray-400" />
            <span>Veuillez recharger votre compte MTN MoMo</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Wallet size={18} className="text-gray-400" />
            <span>Ou choisissez un autre mode de paiement</span>
          </div>
        </div>

        <button onClick={() => navigate("/checkout")} className="w-full bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mb-3">
          <ArrowLeft size={18} /> Réessayer
        </button>
        
        <button onClick={() => navigate("/shop")} className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-all">
          Retour à la boutique
        </button>
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

export default OrderDenied;