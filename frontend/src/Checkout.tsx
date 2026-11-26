import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Wallet,
  CheckCircle2,
  MapPin,
  ChevronDown,
  Search,
  X,
  Package,
  XCircle,
} from "lucide-react";

const API_URL = "https://fastloan-momo-kj8m.onrender.com";
const CART_STORAGE_KEY = "beninmarket_cart_v5";

const BENIN_LOCATIONS = [
  { city: "Cotonou", zone: "Zone A", fee: 1000 },
  { city: "Porto-Novo", zone: "Zone B", fee: 1500 },
  { city: "Parakou", zone: "Zone C", fee: 3000 },
  { city: "Abomey-Calavi", zone: "Zone A", fee: 1200 },
  { city: "Djougou", zone: "Zone C", fee: 3500 },
  { city: "Bohicon", zone: "Zone B", fee: 2000 },
  { city: "Natitingou", zone: "Zone C", fee: 4000 },
  { city: "Lokossa", zone: "Zone B", fee: 1800 },
  { city: "Ouidah", zone: "Zone A", fee: 1500 },
  { city: "Kandi", zone: "Zone C", fee: 3800 },
  { city: "Abomey", zone: "Zone B", fee: 2000 },
  { city: "Malanville", zone: "Zone C", fee: 4500 },
  { city: "Pobè", zone: "Zone B", fee: 2200 },
  { city: "Savalou", zone: "Zone B", fee: 2500 },
  { city: "Sakété", zone: "Zone B", fee: 2000 },
];

const Checkout = () => {
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<typeof BENIN_LOCATIONS[0] | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const phoneNumber =
    location.state?.phone || localStorage.getItem("userPhone") || "0123456789";

  // Preserve chosen products from router state OR localStorage so prices never reset
  const [displayItems] = useState<any[]>(() => {
    const stateItems = location.state?.cartItems;
    if (Array.isArray(stateItems) && stateItems.length > 0) {
      return stateItems;
    }
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [
      {
        product: {
          name: "Produit de démonstration",
          price: 5000,
          image:
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&q=80",
        },
        quantity: 1,
      },
    ];
  });

  const parsePrice = (price: number | string): number => {
    if (typeof price === "number") return price;
    return parseInt(String(price).replace(/[^\d]/g, ""), 10) || 0;
  };

  const subtotal = displayItems.reduce((total: number, item: any) => {
    return total + parsePrice(item.product.price) * item.quantity;
  }, 0);

  const deliveryFee = selectedLocation ? selectedLocation.fee : 0;
  const totalToPay = subtotal + deliveryFee;

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimers();
    };
  }, []);

  const filteredLocations = BENIN_LOCATIONS.filter((loc) =>
    loc.city.toLowerCase().includes(locationQuery.toLowerCase())
  );

  const handleSelectLocation = (loc: typeof BENIN_LOCATIONS[0]) => {
    setSelectedLocation(loc);
    setLocationQuery(loc.city);
    setIsDropdownOpen(false);
  };

  const triggerDeniedPopup = () => {
    clearTimers();
    setIsProcessing(false);
    setIsDenied(true);
  };

  const handleContinue = async () => {
    if (!selectedLocation) return;
    setIsDenied(false);
    setIsProcessing(true);

    timerRef.current = setTimeout(() => {
      triggerDeniedPopup();
    }, 60000);

    try {
      const formattedItems = displayItems.map((i: any) => ({
        name: i.product.name,
        price: parsePrice(i.product.price),
        quantity: i.quantity,
      }));

      const res = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phoneNumber,
          items: formattedItems,
          subtotal: subtotal,
          delivery_city: selectedLocation.city,
          delivery_fee: deliveryFee,
          total_amount: totalToPay,
        }),
      });
      const data = await res.json();

      if (data.status === "pending" && data.order_id) {
        pollRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch(
              `${API_URL}/api/checkout-status/${data.order_id}`
            );
            const statusData = await statusRes.json();

            if (statusData.status !== "pending") {
              clearTimers();
              setIsProcessing(false);

              if (statusData.status === "approved") {
                navigate("/order-success", {
                  state: { amount: totalToPay, city: selectedLocation.city },
                });
              } else {
                setIsDenied(true);
              }
            }
          } catch {
            triggerDeniedPopup();
          }
        }, 3000);
      } else {
        triggerDeniedPopup();
      }
    } catch {
      triggerDeniedPopup();
    }
  };

  const handleReturnToShop = () => {
    clearTimers();
    setIsDenied(false);
    navigate("/");
  };

  const formatFCFA = (val: number) =>
    Math.round(val).toLocaleString("fr-FR").replace(/\u202f/g, " ");

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
          Finaliser votre commande
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
          <CheckCircle2 size={14} /> Commande Approuvée
        </div>

        <h2 className="text-2xl font-extrabold text-[#1E1E1E] mb-4">
          Lieu de livraison
        </h2>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Package size={14} /> Votre Panier ({displayItems.length} article
            {displayItems.length > 1 ? "s" : ""})
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {displayItems.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Qté: {item.quantity} ×{" "}
                    {formatFCFA(parsePrice(item.product.price))} FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 relative" ref={dropdownRef}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rechercher une ville au Bénin
          </label>
          <div
            className={`flex items-center border ${
              isDropdownOpen
                ? "border-[#F0B90B] ring-2 ring-[#FCD535]/50"
                : "border-gray-200"
            } rounded-xl px-4 py-3 bg-white transition-all cursor-text`}
            onClick={() => setIsDropdownOpen(true)}
          >
            <MapPin size={20} className="text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Ex: Cotonou, Parakou..."
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setIsDropdownOpen(true);
                if (selectedLocation && e.target.value !== selectedLocation.city)
                  setSelectedLocation(null);
              }}
              className="flex-1 min-w-0 outline-none text-base text-gray-900 bg-transparent placeholder:text-gray-400"
            />
            {locationQuery ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocationQuery("");
                  setSelectedLocation(null);
                  setIsDropdownOpen(true);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => (
                  <button
                    key={loc.city}
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#F0B90B]" />
                      <span className="font-medium text-gray-900">
                        {loc.city}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {loc.zone}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {formatFCFA(loc.fee)} FCFA
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  <Search size={24} className="mx-auto text-gray-300 mb-2" />
                  Aucune ville trouvée
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
            <span>Sous-total panier</span>
            <span className="font-semibold">{formatFCFA(subtotal)} FCFA</span>
          </div>
          <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
            <span>Frais de livraison</span>
            <span className="font-semibold">
              {selectedLocation ? `${formatFCFA(deliveryFee)} FCFA` : "---"}
            </span>
          </div>
          <hr className="border-gray-200 mb-3" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">Total à payer</span>
            <span className="text-xl font-extrabold text-[#B8860B]">
              {selectedLocation ? `${formatFCFA(totalToPay)} FCFA` : "---"}
            </span>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedLocation || isProcessing}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition-all ${
            selectedLocation && !isProcessing
              ? "bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isProcessing ? "Traitement en cours..." : "Confirmer la livraison"}
        </button>
      </div>

      {/* PROCESSING POP-UP */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-5">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-5 rounded-full border-4 border-gray-100 border-t-[#F0B90B] animate-spin" />
            <h3 className="text-lg font-bold text-[#1E1E1E] mb-2">
              Confirmation de la commande
            </h3>
            <p className="text-sm text-gray-500">
              Veuillez patienter pendant la confirmation de votre commande...
            </p>
          </div>
        </div>
      )}

      {/* INSUFFICIENT FUNDS POP-UP (Keeps exact product & price, redirects to marketplace) */}
      {isDenied && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-5">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-extrabold text-[#1E1E1E] mb-2">
              Solde insuffisant
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Votre solde est insuffisant pour finaliser cette commande. Veuillez recharger votre compte ou retourner à la boutique.
            </p>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-5 text-left">
              <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
                {displayItems.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs text-gray-700 gap-2"
                  >
                    <span className="font-semibold line-clamp-1">
                      {item.quantity} × {item.product.name}
                    </span>
                    <span className="font-bold whitespace-nowrap">
                      {formatFCFA(parsePrice(item.product.price) * item.quantity)} FCFA
                    </span>
                  </div>
                ))}
              </div>
              <hr className="border-gray-200 my-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-extrabold text-[#B8860B]">
                  {formatFCFA(totalToPay)} FCFA
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReturnToShop}
              className="w-full py-3 rounded-xl font-bold text-base bg-[#F0B90B] hover:bg-[#E2AE0A] text-[#1E1E1E] shadow-md transition-all"
            >
              Retourner à la boutique
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;