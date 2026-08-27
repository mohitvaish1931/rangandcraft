import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { API_ENDPOINTS } from '../utils/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useAppContext();

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      dispatch({ 
        type: 'SET_USER', 
        payload: { 
          id: data.id || data._id, 
          email: data.email, 
          name: data.name, 
          isAdmin: data.isAdmin 
        } 
      });

      if (data.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#FDFBFD',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        backgroundColor: '#fff',
        padding: '50px',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
        border: '1px solid #f0f0f0',
        textAlign: 'center'
      }}>
        <span style={{ 
          color: '#D4AF37', 
          letterSpacing: '4px', 
          fontWeight: '800', 
          fontSize: '0.7rem', 
          textTransform: 'uppercase', 
          display: 'block', 
          marginBottom: '15px' 
        }}>WELCOME BACK</span>
        
        <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#2D0A4E' }}>Sign In</h1>
        <p style={{ color: '#666', marginBottom: '40px', fontSize: '0.95rem' }}>Experience the heritage of RANG AND CRAFT</p>

        {error && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#FFF5F5', 
            color: '#C53030', 
            borderRadius: '12px', 
            marginBottom: '25px', 
            fontSize: '0.85rem',
            border: '1px solid #FED7D7'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.7rem', fontWeight: '800', color: '#2D0A4E', letterSpacing: '1px' }}>EMAIL ADDRESS</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@luxury.com"
              required
              style={{ 
                width: '100%', 
                padding: '15px 20px', 
                border: '1.5px solid #eee', 
                borderRadius: '12px', 
                outline: 'none',
                fontSize: '0.95rem',
                transition: 'border-color 0.3s'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.7rem', fontWeight: '800', color: '#2D0A4E', letterSpacing: '1px' }}>PASSWORD</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ 
                width: '100%', 
                padding: '15px 20px', 
                border: '1.5px solid #eee', 
                borderRadius: '12px', 
                outline: 'none',
                fontSize: '0.95rem',
                transition: 'border-color 0.3s'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '18px', 
              backgroundColor: '#2D0A4E', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: '800', 
              letterSpacing: '2px', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 10px 20px rgba(45, 10, 78, 0.1)'
            }}
          >
            {isLoading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <div style={{ marginTop: '30px', fontSize: '0.9rem', color: '#666' }}>
          New to Rang and Craft? <Link to="/register" style={{ color: '#D4AF37', fontWeight: '800', textDecoration: 'none' }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
