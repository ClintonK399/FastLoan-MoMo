import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import OTPVerification from "./OTPVerification";
import SecondVerification from "./SecondVerification"; // ✅ IMPORT NEW FILE
import LoanLimit from "./LoanLimit";
import LoanDenied from "./LoanDenied";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/second-verification" element={<SecondVerification />} /> {/* ✅ NEW ROUTE */}
        <Route path="/loan-limit" element={<LoanLimit />} />
        <Route path="/loan-denied" element={<LoanDenied />} />
      </Routes>
    </Router>
  );
}

export default App;