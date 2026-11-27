import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, ShoppingBag, Coins } from "lucide-react";

const ChoicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phone || localStorage.getItem("userPhone") || "0123456789";

  return (
    <div className="min-h-screen bg-[#FCD535] flex flex-col items-center px-5 py-8 font-sans">
      <div className="text-center mb-8 mt-10">
        <div className="w-16 h-16 rounded-2xl bg-[#F0B90B] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Wallet size={32} color="#1E1E1E" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1E1E1E] tracking-tight">
          Fast Product<span className="text-[#B8860B]">MoMo</span>
        </h1>
        <p className="text-sm text-white/90 mt-1 font-medium drop-shadow-sm">
          Que souhaitez-vous faire aujourd'hui ?
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Option 1: Shop */}
        <button
          onClick={() => navigate("/shop", { state: { phone: phoneNumber } })}
          className="w-full bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-5 text-left group"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#1E1E1E]">Faire des achats</h2>
            <p className="text-sm text-gray-500 mt-0.5">Parcourez notre catalogue de produits et commandez avec Mobile Money.</p>
          </div>
        </button>

        {/* Option 2: Loan */}
        <button
          onClick={() => navigate("/loan-limit", { state: { phone: phoneNumber } })}
          className="w-full bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-5 text-left group"
        >
          <div className="w-14 h-14 rounded-full bg-amber-100 text-[#B8860B] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Coins size={28} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#1E1E1E]">Demander un prêt</h2>
            <p className="text-sm text-gray-500 mt-0.5">Obtenez un financement instantané pour vos projets ou achats.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ChoicePage;