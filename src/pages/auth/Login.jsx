import React, { useState } from 'react';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import UserPool from './UserPool';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    const user = new CognitoUser({ Username: email, Pool: UserPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const accessToken = session.getAccessToken().getJwtToken();
        const idToken = session.getIdToken().getJwtToken();
        const uid = session.getIdToken().payload.sub; // ✅ Cognito User Sub (Unique ID)

        // ✅ Store user session data
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('userId', uid);

        // ✅ Notify the app that auth has changed
        window.dispatchEvent(new Event('authChanged'));

        // ✅ Redirect after login
        navigate('/');
      },

      onFailure: (err) => {
        console.error('Login error:', err);
        if (err.code === 'UserNotConfirmedException') {
          setError('Please verify your email before logging in.');
        } else if (err.code === 'NotAuthorizedException') {
          setError('Incorrect username or password.');
        } else if (err.code === 'PasswordResetRequiredException') {
          setError('Password reset required. Please reset your password.');
        } else if (err.code === 'UserNotFoundException') {
          setError('User does not exist.');
        } else {
          setError(err.message || 'Login failed.');
        }
      },
    });
  };

  return (
    <div style={outerContainerStyle}>
      <div style={formContainerStyle}>
        <h2 style={titleStyle}>Login to MUVI</h2>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <button type="submit" style={buttonStyle}>Sign In</button>
        </form>

        {error && <p style={{ color: 'red', marginTop: '0.5rem', textAlign: 'center' }}>{error}</p>}

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>
            Don’t have an account?{' '}
            <Link to="/signup" style={linkStyle}>Sign up</Link>
          </p>
          <p>
            <Link to="/forgot-password" style={linkStyle}>Forgot Password?</Link>
          </p>
        </div>
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

const formContainerStyle = {
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

const titleStyle = {
  textAlign: 'center',
  color: '#e50914',
  marginBottom: '1rem',
};

const linkStyle = {
  color: '#e50914',
  textDecoration: 'none',
};

export default Login;
