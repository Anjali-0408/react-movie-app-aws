import React, { useState } from 'react';
import { CognitoUser } from 'amazon-cognito-identity-js';
import UserPool from './UserPool';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('signup');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    UserPool.signUp(email, password, [], null, (err, data) => {
      if (err) {
        console.error('Signup error:', err);
        if (err.code === 'UsernameExistsException') {
          setError('You already have an account. Please log in.');
        } else {
          setError(err.message || 'Signup failed');
        }
      } else {
        console.log('Signup success:', data);
        setMessage('A verification code has been sent to your email.');
        setStep('confirm');
      }
    });
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const user = new CognitoUser({ Username: email, Pool: UserPool });

    user.confirmRegistration(code, true, (err, result) => {
      if (err) {
        console.error('Confirmation error:', err);
        setError(err.message || 'Confirmation failed');
      } else {
        console.log('Confirmation success:', result);
        setMessage('Your account has been verified! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    });
  };

  return (
    <div style={outerContainerStyle}>
      <div style={boxStyle}>
        <h2 style={headerStyle}>
          {step === 'signup'
            ? 'Create Account'
            : step === 'confirm'
            ? 'Verify Your Email'
            : 'Success!'}
        </h2>

        {step === 'signup' && (
          <form onSubmit={handleSignUp} style={formStyle}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>
              Sign Up
            </button>
          </form>
        )}

        {step === 'confirm' && (
          <form onSubmit={handleConfirm} style={formStyle}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>
              Confirm
            </button>
          </form>
        )}

        {error && (
          <p style={{ color: 'red', marginTop: '0.5rem', textAlign: 'center' }}>{error}</p>
        )}
        {message && (
          <p style={{ color: 'lightgreen', marginTop: '0.5rem', textAlign: 'center' }}>
            {message}
          </p>
        )}

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#e50914' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

// Styles
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

const boxStyle = {
  backgroundColor: '#1c1c1c',
  padding: '2rem',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '400px',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 0 15px rgba(0,0,0,0.5)',
};

const headerStyle = {
  textAlign: 'center',
  color: '#e50914',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const inputStyle = {
  padding: '0.75rem',
  backgroundColor: '#333',
  color: 'white',
  border: '1px solid #555',
  borderRadius: '4px',
};

const buttonStyle = {
  padding: '0.75rem',
  backgroundColor: '#e50914',
  border: 'none',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default Signup;
