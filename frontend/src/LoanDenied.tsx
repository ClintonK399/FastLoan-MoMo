import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, AlertTriangle } from "lucide-react";

const LoanDenied = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(5); 

  useEffect(() => {
    if (timeLeft <= 0) {
      navigate("/");
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

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
            Malheureusement, nous ne pouvons pas approuver votre prêt pour le moment.
          </p>
          
          <div className="error-details">
            <div className="summary-row"><span>Dépôt minimum</span><span className="bold">2 000 FCFA</span></div>
            <div className="summary-row"><span>Déposer sur</span><span className="bold">MTN MoMo</span></div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '20px', fontWeight: 'bold' }}>
            Redirection vers la connexion dans {timeLeft} seconde(s)...
          </p>

          <button onClick={() => navigate("/")} className="btn-primary" style={{ marginTop: '16px' }}>
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanDenied;