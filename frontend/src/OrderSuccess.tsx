import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, PackageCheck, Truck, MapPin, Phone, CheckCircle2, ShieldCheck } from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const totalAmount = location.state?.amount || 15000;
  const deliveryCity = location.state?.city || "Cotonou";
  const trackingNumber = `FP-${Math.floor(100000 + Math.random() * 900000)}`;

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
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-green-100">
          <PackageCheck size={40} className="text-green-600" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-2">Commande Confirmée !</h2>
        <p className="text-sm text-gray-500 mb-6">Votre paiement a été reçu et votre commande est en cours de préparation.</p>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">N° de suivi</span>
          <span className="font-mono font-bold text-gray-900 tracking-wider">{trackingNumber}</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 text-left space-y-4 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider border-b border-gray-100 pb-2">Détails de la livraison</h3>
          <div className="flex items-start gap-3">
            <Truck className="text-[#B8860B] mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="text-sm font-bold text-gray-900">Livraison estimée</p>
              <p className="text-xs text-gray-500">Sous 24h à 48h ouvrables</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="text-[#B8860B] mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="text-sm font-bold text-gray-900">Destination</p>
              <p className="text-xs text-gray-500">{deliveryCity}, Bénin</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-[#B8860B] mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="text-sm font-bold text-gray-900">Paiement sécurisé</p>
              <p className="text-xs text-gray-500">Débité via MTN MoMo : {formatFCFA(totalAmount)} FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3 text-left">
          <Phone className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-xs text-blue-900 leading-relaxed font-medium">
            Notre livreur vous appellera sur votre numéro MoMo dès qu'il sera en route.
          </p>
        </div>

        <button onClick={() => navigate("/shop")} className="w-full bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
          <CheckCircle2 size={18} /> Retour à la boutique
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;