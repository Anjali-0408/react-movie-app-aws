import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Chip,
  Divider
} from '@mui/material';

const MovieDetails = () => {
  const { id } = useParams(); 
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    axios.get(`https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/get-movie?id=${id}`)
      .then(res => {
        console.log('Fetched movie:', res.data);
        setMovie(res.data.movie || res.data);
      })
      .catch(err => {
        console.error('Error fetching movie details:', err);
      });
  }, [id]);

  if (!movie) {
    return <Typography color="white" sx={{ mt: 4 }}>Loading movie details...</Typography>;
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <Paper sx={{ p: 4, backgroundColor: '#1e1e1e', color: 'white' }}>
        <Box display="flex" gap={4} flexDirection={{ xs: 'column', md: 'row' }}>
          <Avatar
            variant="rounded"
            src={movie.poster_url}
            alt={movie.title}
            sx={{ width: 200, height: 300, borderRadius: 2 }}
          />

          <Box>
            <Typography variant="h4" color="red" gutterBottom>{movie.title}</Typography>
            <Typography variant="subtitle1" gutterBottom>
              {movie.summary || 'No summary available.'}
            </Typography>
            <Divider sx={{ my: 2, borderColor: '#333' }} />

            <Typography variant="body1"><strong>Year:</strong> {movie.release_year || 'N/A'}</Typography>
            <Typography variant="body1"><strong>Director:</strong> {movie.director || 'N/A'}</Typography>
            <Typography variant="body1"><strong>Actors:</strong> {movie.actors || 'N/A'}</Typography>
            <Typography variant="body1"><strong>Language:</strong> {movie.language || 'N/A'}</Typography>
            <Typography variant="body1"><strong>Rating</strong> {movie.rating}⭐</Typography>

            <Box mt={2}>
              <Chip label={movie.genre_name || 'Unknown Genre'} sx={{ bgcolor: 'red', color: 'white' }} />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default MovieDetails;
