import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, skip the login page entirely
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Securely store token
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminName', data.name);
        
        // Redirect to dashboard replacing history
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMsg(data.message || 'Invalid Credentials');
      }
    } catch (err) {
      setErrorMsg('Server connection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-layout">
      {/* Left side form */}
      <div className="al-form-section">
        <div className="admin-login-card">
          <div className="al-header">
            <div className="al-logo">✈️ F2S</div>
            <h2>Admin Portal</h2>
            <p>Sign in to your restricted access</p>
          </div>

          {errorMsg && <div className="al-error">{errorMsg}</div>}

          <form onSubmit={handleLogin} className="al-form">
            <div className="al-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="al-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="al-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Right side image */}
      <div className="al-image-section">
        <div className="al-image-overlay">
          <h2>Flights2Success</h2>
          <p>Elevating your business management.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
