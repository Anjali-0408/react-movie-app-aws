import React, { useState, useEffect } from 'react';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { useLocation, useNavigate } from 'react-router-dom';
import UserPool from './UserPool';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleReset = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !code || !newPassword) {
      setError('All fields are required.');
      return;
    }

    const user = new CognitoUser({ Username: email, Pool: UserPool });

    user.confirmPassword(code, newPassword, {
      onSuccess: () => {
        setMessage('Password successfully changed! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      },
      onFailure: (err) => {
        console.error('Reset error:', err);
        setError(err.message || 'Reset failed');
      },
    });
  };

  return (
    <div style={outerContainerStyle}>
      <form onSubmit={handleReset} style={formStyle}>
        <h2 style={titleStyle}>Reset Password</h2>

        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="text"
          value={code}
          placeholder="Verification Code"
          onChange={(e) => setCode(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          value={newPassword}
          placeholder="New Password"
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Confirm
        </button>

        {error && <p style={errorStyle}>{error}</p>}
        {message && <p style={messageStyle}>{message}</p>}
      </form>
    </div>
  );
};

// Shared styles
const outerContainerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'black',
  zIndex: 9999,
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '300px',
  gap: '1rem',
  backgroundColor: '#1c1c1c',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 0 15px rgba(0,0,0,0.7)',
  color: 'white',
};

const titleStyle = {
  textAlign: 'center',
  color: '#e50914',
};

const inputStyle = {
  padding: '0.75rem',
  backgroundColor: '#2c2c2c',
  color: 'white',
  border: '1px solid #444',
  borderRadius: '4px',
};

const buttonStyle = {
  padding: '0.75rem',
  backgroundColor: '#e50914',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const errorStyle = { color: 'red', textAlign: 'center' };
const messageStyle = { color: 'lightgreen', textAlign: 'center' };

export default ResetPassword;
