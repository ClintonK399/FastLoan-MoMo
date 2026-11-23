import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, PackageCheck, Truck, MapPin, Phone, CheckCircle2, ShieldCheck } from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get total amount and delivery city from the Checkout page
  const totalAmount = location.state?.amount || 15000;
  const deliveryCity = location.state?.city || "Cotonou";

  // Simulate a tracking number
  const trackingNumber = `FP-${Math.floor(100000 + Math.random() * 900000)}`;

  const formatFCFA = (val: number) => {
    return Math.round(val).toLocaleString("fr-FR").replace(/\u202f/g, " ");
  };

  return (
    <div className="min-h-screen bg-[#FCD535] flex flex-col items-center px-5 py-8 font-sans">

      {/* HEADER */}
      <div className="text-center mb-8 mt-4">
        <div className="w-16 h-16 rounded-2xl bg-[#F0B90B] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Wallet size={32} color="#1E1E1E" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1E1E1E] tracking-tight">
          Fast Product<span className="text-[#B8860B]">MoMo</span>
        </h1>
        <p className="text-sm text-white/90 mt-1 font-medium drop-shadow-sm">
          Confirmation de commande
        </p>
      </div>

      {/* MAIN CARD */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 text-center">
        
        {/* SUCCESS ICON */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-green-100">
          <PackageCheck size={40} className="text-green-600" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-2">
          Commande Confirmée !
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Merci pour votre achat. Votre commande a été traitée avec succès et votre paiement a été reçu.
        </p>

        {/* TRACKING NUMBER */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">N° de suivi</span>
          <span className="font-mono font-bold text-gray-900 tracking-wider">{trackingNumber}</span>
        </div>

        {/* DELIVERY DETAILS */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 text-left space-y-4 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider border-b border-gray-100 pb-2">
            Détails de la livraison
          </h3>
          
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

        {/* NOTIFICATION BOX */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3 text-left">
          <Phone className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
          <p className="text-xs text-blue-900 leading-relaxed font-medium">
            Notre livreur vous appellera sur votre numéro MoMo dès qu'il sera en route pour confirmer votre disponibilité.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3">
          <button 
            onClick={() => navigate("/")} 
            className="w-full bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            Retour à la boutique
          </button>
          
          <button 
            onClick={() => navigate("/login")} 
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-all"
          >
            Se déconnecter
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;