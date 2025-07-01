import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'black',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#1c1c1c',
          padding: '2rem',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 15px rgba(0,0,0,0.5)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
