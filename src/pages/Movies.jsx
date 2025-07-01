import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Grid, Card, CardMedia, CardContent, Typography, CircularProgress, Box,
  Modal, IconButton, Divider, Tooltip, Pagination
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { SearchContext } from '../context/SearchContext';
import { GenreContext } from '../context/GenreContext';
import { FavoritesContext } from '../context/FavoritesContext';

const Movies = () => {
  const { searchQuery } = useContext(SearchContext);
  const { selectedGenreId } = useContext(GenreContext);
  const { favorites, toggleFavorite } = useContext(FavoritesContext);

  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [hoveredMovieId, setHoveredMovieId] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoverLoading, setHoverLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setLoading(true);
    let apiUrl = 'https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/list-movies-cards';
    if (selectedGenreId) apiUrl += `?genre_id=${selectedGenreId}`;

    axios.get(apiUrl)
      .then(res => setMovies(res.data.movies || []))
      .catch(err => {
        console.error('Error fetching movies:', err);
        alert('Failed to fetch movies. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [selectedGenreId]);

  const handleMouseEnter = async (event, id) => {
    setHoveredMovieId(id);
    setHoverPosition({ x: event.clientX, y: event.clientY });
    setHoverLoading(true);
    try {
      const res = await axios.get(`https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/get-movies?id=${id}`);
      setSelectedMovie(res.data);
    } catch (err) {
      console.error('Error fetching full movie details:', err);
    } finally {
      setHoverLoading(false);
    }
  };

  const handleMouseLeave = () => setHoveredMovieId(null);

  const handleCardClick = async (id) => {
    try {
      const res = await axios.get(`https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/get-movies?id=${id}`);
      setSelectedMovie(res.data);
      setModalOpen(true);
    } catch (err) {
      console.error('Error opening modal:', err);
      alert('Could not load movie details.');
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMovie(null);
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovies = filteredMovies.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenreId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (filteredMovies.length === 0) {
    return (
      <Typography color="white" sx={{ mt: 4, textAlign: 'center' }}>
        No movies found.
      </Typography>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', px: 3, pt: 10 }}>
      <Grid container spacing={2}>
        {paginatedMovies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
            <Card
              onMouseEnter={(e) => handleMouseEnter(e, movie.id)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleCardClick(movie.id)}
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
            >
              <Tooltip title="Toggle Favorite">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(movie);
                  }}
                  sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, color: 'red' }}
                >
                  {favorites.some((fav) => fav.id === movie.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
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
                  {movie.title}
                </Typography>
                <Typography variant="body2" color="gray" noWrap>
                  Genre: {movie.genre_name}
                </Typography>
                <Typography variant="body2" color="gray" noWrap>
                  Language: {movie.language}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, value) => setCurrentPage(value)}
            variant="outlined"
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': { color: 'white', borderColor: 'gray' },
              '& .Mui-selected': { backgroundColor: 'red', color: 'white', borderColor: 'red' },
            }}
          />
        </Box>
      )}

      {/* Hover Popup */}
      {selectedMovie && hoveredMovieId && !modalOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: hoverPosition.y + 10,
            left: hoverPosition.x + 10,
            width: 320,
            backgroundColor: '#121212',
            borderRadius: '10px',
            boxShadow: 6,
            zIndex: 9999,
            p: 2,
            color: 'white',
            pointerEvents: 'none',
          }}
        >
          {hoverLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              <img
                src={selectedMovie.banner_url || selectedMovie.poster_url || 'https://via.placeholder.com/320x180?text=No+Image'}
                alt={selectedMovie.title}
                style={{ width: '100%', borderRadius: '8px', marginBottom: '12px' }}
              />
              <Typography variant="h6">{selectedMovie.title}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>Genre:</strong> {selectedMovie.genre_name}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>Year:</strong> {selectedMovie.release_year}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>Language:</strong> {selectedMovie.language}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {selectedMovie.summary?.slice(0, 120) || 'No summary available.'}
              </Typography>
            </>
          )}
        </Box>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#1e1e1e',
          color: 'white',
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
          width: { xs: '90%', md: '50%' },
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ color: 'red' }}>{selectedMovie?.title}</Typography>
            <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 2, bgcolor: 'gray' }} />
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
            <img
              src={selectedMovie?.poster_url || 'https://via.placeholder.com/200x300?text=No+Image'}
              alt={selectedMovie?.title}
              style={{ width: 200, height: 300, borderRadius: 8 }}
            />
            <Box>
              <Typography variant="body1"><strong>Genre:</strong> {selectedMovie?.genre_name}</Typography>
              <Typography variant="body1"><strong>Language:</strong> {selectedMovie?.language}</Typography>
              <Typography variant="body1"><strong>Year:</strong> {selectedMovie?.release_year}</Typography>
              <Typography variant="body1"><strong>Director:</strong> {selectedMovie?.director}</Typography>
              <Typography variant="body1"><strong>Actors:</strong> {selectedMovie?.actors}</Typography>
              <Typography variant="body2" sx={{ mt: 2 }}><strong>Summary:</strong> {selectedMovie?.summary || 'No summary available.'}</Typography>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Movies;
