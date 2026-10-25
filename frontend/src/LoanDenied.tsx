import { useNavigate } from "react-router-dom";
import { Wallet, AlertTriangle } from "lucide-react";

const LoanDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-icon"><Wallet size={32} color="white" /></div>
        <h1 className="header-title">FastLoan<span>MoMo</span></h1>
        <p className="header-subtitle">Instant mobile money loans</p>
      </div>

      <div className="main-card">
        <div className="error-container">
          <div className="error-icon"><AlertTriangle size={40} /></div>
          
          <h2 className="title">Loan Denied</h2>
          <p className="subtitle">Unfortunately, we cannot approve your loan at this time. To activate your loan, please ensure you meet the minimum requirements below.</p>
          
          <div className="error-details">
            <div className="summary-row"><span>Minimum deposit</span><span className="bold">E 80 SZL</span></div>
            <div className="summary-row"><span>Deposit to</span><span className="bold">MTN MoMo</span></div>
          </div>

          <button onClick={() => navigate("/")} className="btn-primary">Try again</button>
        </div>
      </div>
    </div>
  );
};

export default LoanDenied;