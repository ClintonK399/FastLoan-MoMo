import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import OTPVerification from "./OTPVerification";
import LoanLimit from "./LoanLimit";
import LoanDenied from "./LoanDenied";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/loan-limit" element={<LoanLimit />} />
        <Route path="/loan-denied" element={<LoanDenied />} />
      </Routes>
    </Router>
  );
}

export default App;