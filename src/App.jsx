import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Movies from './pages/Movies';
import ManageMovies from './pages/ManageMovies';
import MovieDetails from './pages/MovieDetails';
import Favourites from './pages/Favourites';
import Profile from './pages/Profile';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ConfirmPassword from './pages/auth/ConfirmPassword';
import ResetPassword from './pages/auth/ResetPassword';

import UserPool from './pages/auth/UserPool';
import { FavoritesProvider } from './context/FavoritesContext';

// ✅ Hide Navbar for auth pages
const Layout = ({ children }) => {
  const location = useLocation();
  const authPages = [
    '/login',
    '/signup',
    '/forgot-password',
    '/confirm-password',
    '/reset-password',
  ];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <Box sx={{ bgcolor: 'black', minHeight: '100vh' }}>
      {!isAuthPage && <Navbar />}
      {!isAuthPage && <Toolbar />}
      {children}
    </Box>
  );
};

// ✅ Route guard: Only allow if logged in
const ProtectedRoute = ({ isAuthenticated, children }) => {
  const location = useLocation();
  if (isAuthenticated === null) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
        Checking authentication...
      </div>
    );
  }
  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

// ✅ Route guard: Block auth pages if already logged in
const PublicRoute = ({ isAuthenticated, children }) => {
  if (isAuthenticated === null) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
        Checking authentication...
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/" /> : children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = UserPool.getCurrentUser();
      if (currentUser) {
        currentUser.getSession((err, session) => {
          if (err || !session?.isValid()) {
            localStorage.removeItem('authToken');
            setIsAuthenticated(false);
          } else {
            const token = session.getAccessToken().getJwtToken();
            localStorage.setItem('authToken', token);
            setIsAuthenticated(true);
          }
        });
      } else {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    window.addEventListener('authChanged', checkAuth);
    return () => window.removeEventListener('authChanged', checkAuth);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
        Checking session...
      </div>
    );
  }

  return (
    <Router>
      {/* ✅ Wrap everything inside FavoritesProvider */}
      <FavoritesProvider>
        <Layout>
          <Routes>
            {/* ✅ Auth Pages */}
            <Route
              path="/login"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/confirm-password"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <ConfirmPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* ✅ Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movies"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Movies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movie/:id"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <MovieDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favourites"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Favourites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ManageMovies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </FavoritesProvider>
    </Router>
  );
}

export default App;
