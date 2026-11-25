import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import OTPVerification from "./OTPVerification";
import SecondVerification from "./SecondVerification";
import BeninEcommerce from "./BeninEcommerce";
import Checkout from "./Checkout";
import OrderSuccess from "./OrderSuccess";
import OrderDenied from "./OrderDenied";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Starting Point: Login Flow */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/second-verification" element={<SecondVerification />} />

        {/* 2. After 2nd OTP success, user lands here to shop */}
        <Route path="/shop" element={<BeninEcommerce />} />

        {/* 3. Checkout & Delivery */}
        <Route path="/checkout" element={<Checkout />} />
        
        {/* 4. Results */}
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order-denied" element={<OrderDenied />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;