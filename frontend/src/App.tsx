import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import OTPVerification from "./OTPVerification";
import SecondVerification from "./SecondVerification";
import ChoicePage from "./ChoicePage"; // ✅ NEW
import BeninEcommerce from "./BeninEcommerce";
import Checkout from "./Checkout";
import OrderSuccess from "./OrderSuccess";
import OrderDenied from "./OrderDenied";
import LoanLimit from "./LoanLimit"; // ✅ NEW
import LoanSuccess from "./LoanSuccess"; // ✅ NEW
import LoanDenied from "./LoanDenied"; // ✅ NEW
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Flow */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/second-verification" element={<SecondVerification />} />
        
        {/* ✅ NEW: Landing page after OTP to choose Shop or Loan */}
        <Route path="/choice" element={<ChoicePage />} />

        {/* Shopping Flow */}
        <Route path="/shop" element={<BeninEcommerce />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order-denied" element={<OrderDenied />} />

        {/* Loan Flow */}
        <Route path="/loan-limit" element={<LoanLimit />} />
        <Route path="/loan-success" element={<LoanSuccess />} />
        <Route path="/loan-denied" element={<LoanDenied />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;