import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, TextField, Button, Typography, MenuItem, Paper, IconButton, Avatar, Pagination
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const ManageMovies = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState({
    title: '', genre_id: '', summary: '', language: '',
    poster_url: '', update_url: '', release_year: '', director: '', actors: '', genre_name: ''
  });
  const [errors, setErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = () => {
    axios.get('https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/list-genre')
      .then(res => setGenres(res.data.genres || res.data))
      .catch(err => console.error('Error fetching genres:', err));

    axios.get('https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/list-movies')
      .then(res => setMovies(res.data.movies || res.data))
      .catch(err => console.error('Error fetching movies:', err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [searchQuery, filterGenre, filterLanguage, filterYear]);

  const genreNames = [...new Set(movies.map(m => m.genre_name).filter(Boolean))];
  const languages = [...new Set(movies.map(m => m.language).filter(Boolean))];
  const years = [...new Set(movies.map(m => m.release_year).filter(Boolean))].sort((a, b) => b - a);

  const filteredMovies = movies.filter((movie) => {
    const titleMatch = movie.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const genreMatch = !filterGenre || movie.genre_name === filterGenre;
    const languageMatch = !filterLanguage || (movie.language || '').toLowerCase() === filterLanguage.toLowerCase();
    const yearMatch = !filterYear || (movie.release_year?.toString() === filterYear);
    return titleMatch && genreMatch && languageMatch && yearMatch;
  });

  const paginatedMovies = filteredMovies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'release_year' && !/^\d{0,4}$/.test(value)) return;

    if (name === 'genre_id') {
      const selectedGenre = genres.find(g => g.genre_id === value);
      setForm({ ...form, genre_id: value, genre_name: selectedGenre?.genre_name || '' });
      setErrors({ ...errors, genre_id: '' });
      return;
    }

    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await axios.post('https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/generate-presigned-url', {
        file_name: file.name,
        content_type: file.type,
      });

      const { url, fields, file_url } = res.data;
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
      formData.append("file", file);

      await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(prev => ({ ...prev, poster_url: file_url }));
      setErrors(prev => ({ ...prev, poster_url: '' }));

      alert("Upload successful!");
    } catch (error) {
      console.error('Upload failed', error);
      alert('Image upload failed');
    }
  };

  const resetForm = () => {
    setForm({
      title: '', genre_id: '', genre_name: '', language: '', summary: '',
      poster_url: '', update_url: '', release_year: '', director: '', actors: ''
    });
    setErrors({});
    setEditMode(false);
    setEditId(null);
  };

  const handleSubmit = async () => {
    const requiredFields = ['title', 'genre_id', 'language', 'summary', 'director', 'actors', 'release_year'];
    let newErrors = {};
    requiredFields.forEach(field => {
      if (!form[field] || form[field].toString().trim() === '') {
        newErrors[field] = `${field.replace('_', ' ')} is required`;
      }
    });

    if (form.release_year !== '' && (!/^\d{4}$/.test(form.release_year) || parseInt(form.release_year) > new Date().getFullYear())) {
      newErrors.release_year = 'Enter a valid year';
    }

    if (!form.poster_url) {
      newErrors.poster_url = 'Poster is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const { genre_name, update_url, ...payload } = form;
    const api = editMode
      ? `https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/update-movies?id=${editId}`
      : 'https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/create-movies';
    const method = editMode ? 'put' : 'post';

    try {
      await axios[method](api, payload);
      alert(`Movie ${editMode ? 'updated' : 'created'} successfully!`);
      resetForm();
      fetchData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    axios.delete(`https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/delete-movies?id=${id}`)
      .then(() => {
        alert('Movie deleted');
        fetchData();
      })
      .catch((err) => alert('Delete failed: ' + err.message));
  };

  const handleEdit = (movie) => {
    setEditMode(true);
    setEditId(movie.id);
    const matchedGenre = genres.find(g => g.genre_id === movie.genre_id || g.genre_name === movie.genre_name);
    setForm({
      title: movie.title || '',
      genre_id: matchedGenre?.genre_id || '',
      genre_name: matchedGenre?.genre_name || movie.genre_name || '',
      language: movie.language || '',
      summary: movie.summary || '',
      poster_url: movie.poster_url || '',
      update_url: '',
      release_year: movie.release_year || '',
      director: movie.director || '',
      actors: movie.actors || ''
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fields = [
    { label: "Title", name: "title" },
    { label: "Language", name: "language" },
    { label: "Summary", name: "summary", multiline: true, rows: 3 },
    { label: "Release Year", name: "release_year" },
    { label: "Director", name: "director" },
    { label: "Actors", name: "actors" }
  ];

  return (
    <Box sx={{ p: 4, backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <Typography variant="h4" mb={2} color="red">{editMode ? 'Edit Movie' : 'Create Movie'}</Typography>

      {/* Movie Form */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: '#1e1e1e', color: 'white' }}>
        {fields.map((field, idx) => (
          <TextField
            key={idx}
            fullWidth
            label={field.label}
            name={field.name}
            value={form[field.name]}
            onChange={handleChange}
            error={!!errors[field.name]}
            helperText={errors[field.name]}
            multiline={field.multiline}
            rows={field.rows}
            sx={{ mb: 2, '& .MuiInputBase-root': { backgroundColor: '#2c2c2c', color: 'white' } }}
          />
        ))}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">Upload Poster</Typography>
          <input type="file" accept="image/*" onChange={handleFileUpload} />
          {errors.poster_url && <Typography color="red" variant="caption">{errors.poster_url}</Typography>}
        </Box>

        <TextField
          fullWidth
          select
          label="Genre"
          name="genre_id"
          value={form.genre_id}
          onChange={handleChange}
          error={!!errors.genre_id}
          helperText={errors.genre_id}
          sx={{ mb: 2, '& .MuiInputBase-root': { backgroundColor: '#2c2c2c', color: 'white' } }}
        >
          <MenuItem value="">Select Genre</MenuItem>
          {Array.isArray(genres) && genres.map((g) => (
            <MenuItem key={g.genre_id} value={g.genre_id}>{g.genre_name}</MenuItem>
          ))}
        </TextField>

        <Box display="flex" gap={2}>
          <Button variant="contained" sx={{ bgcolor: 'red' }} onClick={handleSubmit}>
            {editMode ? 'Update Movie' : 'Create Movie'}
          </Button>
          {editMode && (
            <Button variant="outlined" color="secondary" onClick={resetForm}>Cancel</Button>
          )}
        </Box>
      </Paper>

      {/* Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 5 }}>
        <Typography variant="h5" color="red">All Movies</Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <TextField size="large" label="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ backgroundColor: 'grey', borderRadius: 4 ,minWidth: 200}} />
          <TextField size="large" select label="Genre" value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} sx={{ backgroundColor: 'grey', borderRadius: 4,minWidth: 120 }}>
            <MenuItem value="">All</MenuItem>
            {genreNames.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </TextField>
          <TextField size="large" select label="Year" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} sx={{ backgroundColor: 'grey', borderRadius: 4,minWidth: 120 }}>
            <MenuItem value="">All</MenuItem>
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
          <TextField size="large" select label="Language" value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)} sx={{ backgroundColor: 'grey', borderRadius: 4,minWidth: 120 }}>
            <MenuItem value="">All</MenuItem>
            {languages.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </TextField>
        </Box>
      </Box>

      {/* Movie List */}
      {paginatedMovies.length === 0 ? (
        <Typography>No movies found.</Typography>
      ) : (
        paginatedMovies.map((movie) => (
          <Paper
            key={movie.id}
            sx={{
              p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: '#1e1e1e', color: 'white', borderLeft: '5px solid red',
              '&:hover': { backgroundColor: '#2c2c2c' }
            }}
          >
            <Box>
              <Typography variant="subtitle1">{movie.title}</Typography>
            </Box>
            <Box>
              <IconButton onClick={() => handleEdit(movie)} sx={{ color: 'red' }}><Edit /></IconButton>
              <IconButton onClick={() => handleDelete(movie.id)} sx={{ color: 'red' }}><Delete /></IconButton>
            </Box>
          </Paper>
        ))
      )}

      {/* Pagination */}
      {filteredMovies.length > itemsPerPage && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(filteredMovies.length / itemsPerPage)}
            page={currentPage}
            onChange={(e, value) => setCurrentPage(value)}
            variant="outlined"
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
                borderColor: 'gray',
              },
              '& .Mui-selected': {
                backgroundColor: 'red',
                color: 'white',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ManageMovies;
