import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, AlertTriangle } from "lucide-react";

const LoanDenied = () => {
  const navigate = useNavigate();

  // ✅ Silent background timer: Waits 5 seconds then redirects
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000); // 5000 ms = 5 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

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
            <div className="summary-row"><span>Dépôt minimum</span><span className="bold">2 000 FCFA</span></div>
            <div className="summary-row"><span>Déposer sur</span><span className="bold">MTN MoMo</span></div>
          </div>

          {/* ❌ The countdown text has been completely removed from here */}

          <button onClick={() => navigate("/")} className="btn-primary" style={{ marginTop: '20px' }}>
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanDenied;