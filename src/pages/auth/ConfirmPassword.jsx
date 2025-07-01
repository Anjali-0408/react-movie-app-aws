import React, { useState, useEffect } from 'react';
import { CognitoUser } from 'amazon-cognito-identity-js';
import UserPool from './UserPool';
import { useLocation, useNavigate } from 'react-router-dom';

const ConfirmPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleConfirm = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const user = new CognitoUser({ Username: email, Pool: UserPool });

    user.confirmPassword(code, newPassword, {
      onSuccess: () => {
        setMessage('Password changed! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      },
      onFailure: (err) => {
        setError(err.message || 'Failed to reset password.');
      },
    });
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleConfirm} style={formStyle}>
        <h2 style={titleStyle}>Reset Password</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          placeholder="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>Confirm</button>

        {error && <p style={errorStyle}>{error}</p>}
        {message && <p style={messageStyle}>{message}</p>}
      </form>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  height: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'black',
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

export default ConfirmPassword;
