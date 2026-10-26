import { useNavigate } from "react-router-dom";
import { Wallet, AlertTriangle } from "lucide-react";

const LoanDenied = () => {
  const navigate = useNavigate();

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
          
          <h2 className="title">Prêt refusé</h2>
          <p className="subtitle">Malheureusement, nous ne pouvons pas approuver votre prêt pour le moment. Pour activer votre prêt, veuillez vous assurer de respecter les exigences minimales ci-dessous.</p>
          
          <div className="error-details">
            <div className="summary-row"><span>Dépôt minimum</span><span className="bold">2 000 FCFA</span></div>
            <div className="summary-row"><span>Déposer sur</span><span className="bold">MTN MoMo</span></div>
          </div>

          <button onClick={() => navigate("/")} className="btn-primary">Réessayer</button>
        </div>
      </div>
    </div>
  );
};

export default LoanDenied;