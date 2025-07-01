import React, { useContext, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { FavoritesContext } from '../context/FavoritesContext';

const Favourites = () => {
  const { favorites, toggleFavorite } = useContext(FavoritesContext);
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', px: 3, pt: 10 }}>
      <Typography variant="h4" color="white" mb={4} textAlign="center">
        Your Favourites
      </Typography>

      {(!favorites || favorites.length === 0) ? (
        <Typography sx={{ color: 'gray', textAlign: 'center', mt: 4 }}>
          You haven't added any favorite movies yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {favorites.map((movie) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id || movie.movie_id}>
              <Card
                sx={{
                  minWidth: 200,
                  maxWidth: 200,
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                  borderRadius: 3,
                  flexShrink: 0,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.06)',
                    boxShadow: 8,
                  },
                  mx: 'auto',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onMouseEnter={() => setHoveredId(movie.id || movie.movie_id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Tooltip title="Remove from Favorites">
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(movie);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      color: 'red',
                    }}
                  >
                    {favorites.some((fav) => (fav.id || fav.movie_id) === (movie.id || movie.movie_id)) ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </Tooltip>

                <CardMedia
                  component="img"
                  height="300"
                  image={movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}
                  alt={movie.title}
                  sx={{
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    objectFit: 'cover',
                    backgroundColor: '#000',
                  }}
                />

                <CardContent>
                  <Typography variant="subtitle1" noWrap fontWeight="600">
                    {movie.title || 'Untitled'}
                  </Typography>
                  <Typography variant="body2" color="gray" noWrap>
                    Genre: {movie.genre_name || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="gray" noWrap>
                    Language: {movie.language || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Favourites;
