import React, { useState } from 'react';
import { CognitoUser } from 'amazon-cognito-identity-js';
import UserPool from './UserPool';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleForgot = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const user = new CognitoUser({ Username: email, Pool: UserPool });

    user.forgotPassword({
      onSuccess: () => {
        setMessage('Code sent to your email. Redirecting...');
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 2000);
      },
      onFailure: (err) => {
        console.error('Error:', err);
        setError(err.message || 'Failed to send verification code.');
      },
    });
  };

  return (
    <div style={outerContainerStyle}>
      <form onSubmit={handleForgot} style={formStyle}>
        <h2 style={titleStyle}>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>Send Code</button>

        {error && <p style={errorStyle}>{error}</p>}
        {message && <p style={messageStyle}>{message}</p>}
      </form>
    </div>
  );
};

// Shared full-screen center layout
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
  gap: '1rem',
  width: '300px',
  backgroundColor: '#1c1c1c',
  padding: '2rem',
  borderRadius: '8px',
  color: 'white',
  boxShadow: '0 0 15px rgba(0,0,0,0.7)',
};

const titleStyle = { textAlign: 'center', color: '#e50914' };
const inputStyle = {
  padding: '0.75rem',
  borderRadius: '4px',
  border: '1px solid #444',
  backgroundColor: '#2c2c2c',
  color: 'white',
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

export default ForgotPassword;
