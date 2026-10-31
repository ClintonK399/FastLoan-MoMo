import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, AlertTriangle } from "lucide-react";

const LoanDenied = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const loanAmount = location.state?.amount || 50000;

  const getMinimumDeposit = (amount: number) => {
    if (amount <= 50000) return 5000;
    if (amount <= 100000) return 10000;
    if (amount <= 1000000) return 50000;
    return 70000;
  };

  const minDeposit = getMinimumDeposit(loanAmount);

  const formatFCFA = (val: number) => {
    return val.toLocaleString("fr-FR").replace(/\u202f/g, " ");
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-icon"><Wallet size={32} color="white" /></div>
        <h1 className="header-title">FastLoan<span>MoMo</span></h1>
        <p className="header-subtitle">Prêts mobiles instantanés</p>
      </div>

      <div className="main-card">
        <div className="error-container">
          <div className="error-icon"><AlertTriangle size={40} /></div>
          
          <h2 className="title">Demande refusée</h2>
          <p className="subtitle">
            Malheureusement, nous ne pouvons pas approuver votre prêt pour le moment. Veuillez vous assurer que vous répondez aux exigences minimales.
          </p>
          
          <div className="error-details">
            <div className="summary-row">
              <span>Dépôt minimum</span>
              <span className="bold">{formatFCFA(minDeposit)} FCFA</span>
            </div>
            <div className="summary-row">
              <span>Déposer sur</span>
              <span className="bold">MTN MoMo</span>
            </div>
          </div>

          {/* ✅ NEW BUTTON: "Aller au tableau de bord" */}
          <button onClick={() => navigate("/")} className="btn-primary" style={{ marginTop: '24px', backgroundColor: '#111827', color: 'white' }}>
            Aller au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanDenied;