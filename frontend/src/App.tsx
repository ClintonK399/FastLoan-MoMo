import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import BeninEcommerce from "./BeninEcommerce";        // ✅ entry point (TSX)
import Login from "./Login";
import OTPVerification from "./OTPVerification";
import SecondVerification from "./SecondVerification";
import LoanLimit from "./LoanLimit";
import LoanDenied from "./LoanDenied";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Ecommerce shown first */}
        <Route path="/" element={<BeninEcommerce />} />

        {/* Login now lives here */}
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/second-verification" element={<SecondVerification />} />
        <Route path="/loan-limit" element={<LoanLimit />} />
        <Route path="/loan-denied" element={<LoanDenied />} />

        {/* Fallback: any unknown URL goes back to the shop */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;