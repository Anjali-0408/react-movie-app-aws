import React, { useContext, useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Typography,
  Box,
  Rating,
  Modal,
  IconButton,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { FavoritesContext } from '../context/FavoritesContext';

const MovieCard = ({ movie }) => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [fullMovie, setFullMovie] = useState(null);

  const { favorites, toggleFavorite } = useContext(FavoritesContext);

  const isFavorite = favorites.some(
    (fav) => (fav.id || fav.movie_id) === (movie.id || movie.movie_id)
  );

  const handleOpen = async () => {
    try {
      const res = await axios.get(
        `https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/get-movies?id=${movie.id}`
      );
      setFullMovie(res.data);
      setOpen(true);
    } catch (err) {
      console.error('Error fetching movie details:', err);
      alert('Could not load movie details. Please try again.');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFullMovie(null);
  };

  return (
    <>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            width: '100%',
            height: 380,
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#1c1c1c',
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(movie);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: isFavorite ? 'red' : 'white',
              zIndex: 2,
            }}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>

          <Box onClick={handleOpen}>
            <img
              src={movie.poster_url}
              alt={movie.title}
              style={{
                width: '100%',
                height: 270,
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
              }}
            />
          </Box>

          <Fade in={hovered}>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                color: 'white',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                {movie.title}
              </Typography>
              <Typography variant="body2" color="gray">
                Genre: {movie.genre_name}
              </Typography>
              <Typography variant="body2" color="gray">
                Language: {movie.language}
              </Typography>
              <Rating
                value={parseFloat(movie.rating)}
                precision={0.1}
                readOnly
                sx={{ mt: 1 }}
              />
            </Box>
          </Fade>
        </Card>
      </Grid>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: 800,
            bgcolor: '#121212',
            color: 'white',
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', top: 10, right: 10, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>

          {fullMovie ? (
            <>
              <img
                src={fullMovie.banner_url || fullMovie.poster_url}
                alt={fullMovie.title}
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  maxHeight: '300px',
                  objectFit: 'cover',
                }}
              />
              <Typography variant="h4">{fullMovie.title}</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Genre:</strong> {fullMovie.genre_name}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Language:</strong> {fullMovie.language || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                {fullMovie.summary || fullMovie.description || 'No description available.'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>Director:</strong> {fullMovie.director || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Actors:</strong> {fullMovie.actors || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Rating:</strong> {fullMovie.rating}
              </Typography>
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default MovieCard;
