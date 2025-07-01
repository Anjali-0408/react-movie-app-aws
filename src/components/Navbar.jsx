import React, { useEffect, useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  useTheme,
  useMediaQuery,
  Menu,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchContext } from '../context/SearchContext';
import { GenreContext } from '../context/GenreContext';
import UserPool from '../pages/auth/UserPool'; // ✅ Make sure this is correctly imported

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const { selectedGenreId, setSelectedGenreId } = useContext(GenreContext);

  const [genres, setGenres] = useState([]);
  const [movieTitle, setMovieTitle] = useState(null);
  const [moviePoster, setMoviePoster] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const match = location.pathname.match(/^\/movie\/(.+)/);
  const movieId = match ? match[1] : null;

  useEffect(() => {
    axios
      .get('https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/list-genre')
      .then((response) => setGenres(response.data))
      .catch((error) => console.error('Error fetching genres:', error));
  }, []);

  useEffect(() => {
    if (movieId) {
      axios
        .get(`https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/get-movies?id=${movieId}`)
        .then((res) => {
          setMovieTitle(res.data.title);
          setMoviePoster(res.data.poster_url);
        })
        .catch((err) => console.error('Error fetching movie details:', err));
    } else {
      setMovieTitle(null);
      setMoviePoster(null);
    }
  }, [movieId]);

  const handleGenreChange = (e) => {
    setSelectedGenreId(e.target.value);
    navigate('/movies');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    navigate('/movies');
  };

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    // Remove token
    localStorage.removeItem('authToken');

    // Optional: sign out from Cognito
    const currentUser = UserPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }

    // Trigger App to recheck auth and redirect
    window.dispatchEvent(new Event('authChanged'));

    // Show snackbar
    setShowLogoutMessage(true);

    // Navigate to login after short delay
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 1500);

    handleMenuClose();
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: '#141414', boxShadow: 'none', zIndex: 1300 }}>
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            px: { xs: 2, sm: 4 },
            py: 1,
          }}
        >
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', color: 'red', cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              MUVI
            </Typography>

            {!movieId && (
              <>
                <Button color="inherit" onClick={() => navigate('/')} sx={{ color: location.pathname === '/' ? 'red' : 'white' }}>Home</Button>
                <Button color="inherit" onClick={() => navigate('/movies')} sx={{ color: location.pathname.startsWith('/movies') ? 'red' : 'white' }}>Movies</Button>
                <Button color="inherit" onClick={() => navigate('/favourites')} sx={{ color: location.pathname === '/favourites' ? 'red' : 'white' }}>Favourites</Button>
                <Button color="inherit" onClick={() => navigate('/admin')} sx={{ color: location.pathname === '/admin' ? 'red' : 'white' }}>Manage Movies</Button>
              </>
            )}
          </Box>

          {/* Center Section */}
          {movieId ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {moviePoster && <img src={moviePoster} alt={movieTitle} style={{ height: 40, borderRadius: 4 }} />}
              <Typography variant="h6" sx={{ color: 'white' }}>
                {movieTitle || 'Loading...'}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexGrow: 1,
                justifyContent: isMobile ? 'flex-start' : 'center',
              }}
            >
              <Select
                value={selectedGenreId}
                onChange={handleGenreChange}
                displayEmpty
                sx={{
                  color: 'white',
                  border: '1px solid white',
                  height: '35px',
                  fontSize: '0.9rem',
                  '& .MuiSelect-icon': { color: 'white' },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  bgcolor: '#333',
                  borderRadius: 1,
                  px: 1,
                  minWidth: 120,
                }}
              >
                <MenuItem value="">All Genres</MenuItem>
                {Array.isArray(genres) &&
                  genres.map((genre) => (
                    <MenuItem key={genre.genre_id} value={genre.genre_id}>
                      {genre.genre_name}
                    </MenuItem>
                  ))}
              </Select>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#333',
                  px: 1,
                  borderRadius: 1,
                  height: '35px',
                }}
              >
                <SearchIcon sx={{ color: 'white' }} />
                <InputBase
                  placeholder="Search"
                  sx={{ ml: 1, color: 'white' }}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </Box>
            </Box>
          )}

          {/* Right Section: Profile Icon + Menu */}
          <Box>
            <IconButton onClick={handleMenuOpen}>
              <AccountCircleIcon sx={{ color: 'white' }} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleProfile}>Profile Details</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout Snackbar */}
      <Snackbar
        open={showLogoutMessage}
        autoHideDuration={3000}
        onClose={() => setShowLogoutMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={() => setShowLogoutMessage(false)}
          severity="success"
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          Logged out successfully!
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default Navbar;
