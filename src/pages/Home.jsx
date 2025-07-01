import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Pagination,
  Modal,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const HeroBanner = ({ movie }) => {
  if (!movie) return null;

  return (
    <Box
      sx={{
        height: '35vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'start',
        p: { xs: 3, md: 8},
        mb: 8,
        backgroundImage: `url(${movie.poster_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 8,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.3))',
          zIndex: 1,
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2, color: 'white', maxWidth: 600 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {movie.title}
        </Typography>
      </Box>
    </Box>
  );
};

const Section = ({ title, movies, currentPage, setCurrentPage, itemsPerPage }) => {
  const scrollRef = useRef(null);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovies = movies.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(movies.length / itemsPerPage);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <Box sx={{ mb: 6 }}>
      <Typography
        variant="h5"
        sx={{ color: 'white', mb: 2, px: 3, fontWeight: 600 }}
      >
        {title}
      </Typography>

      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          px: 3,
          gap: 2,
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {paginatedMovies.map((movie) => (
          <Card
            key={movie.id}
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
              cursor: 'pointer'
            }}
          >
            <CardMedia
              component="img"
              height="300"
              image={movie.poster_url || '/placeholder.png'}
              alt={movie.title}
              sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            />
            <CardContent>
              <Typography variant="subtitle1" noWrap fontWeight="600">
                {movie.title}
              </Typography>
              <Typography variant="body2" color="#aaa">
                {movie.release_year}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {totalPages > 1 && (
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, value) => setCurrentPage(value)}
            variant="outlined"
            shape="rounded"
            size="small"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
                borderColor: 'gray',
              },
              '& .Mui-selected': {
                backgroundColor: 'red',
                color: 'white',
                borderColor: 'red',
              },
            }}
          />
        </Box>
      )}

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

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [trendingPage, setTrendingPage] = useState(1);
  const [topRatedPage, setTopRatedPage] = useState(1);
  const [newReleasesPage, setNewReleasesPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    axios
      .get(
        'https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/list-movies-cards'
      )
      .then((res) => {
        setMovies(res.data.movies || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching movies:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 10,
          height: '100vh',
          backgroundColor: '#000',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const trending = movies.slice(0, 10);
  const topRated = movies.slice(10, 20);
  const newReleases = movies.filter((m) => m.release_year >= 2023).slice(0, 10);
  const featured = movies[0];

  return (
    <Box sx={{ backgroundColor: '#000', minHeight: '100vh', pb: 6 }}>
      <HeroBanner movie={featured} />
      <Section
        title="Trending Now"
        movies={trending}
        currentPage={trendingPage}
        setCurrentPage={setTrendingPage}
        itemsPerPage={itemsPerPage}
      />
      <Section
        title="Top Picks"
        movies={topRated}
        currentPage={topRatedPage}
        setCurrentPage={setTopRatedPage}
        itemsPerPage={itemsPerPage}
      />
      <Section
        title="New Releases"
        movies={newReleases}
        currentPage={newReleasesPage}
        setCurrentPage={setNewReleasesPage}
        itemsPerPage={itemsPerPage}
      />
    </Box>
  );
};

export default Home;
