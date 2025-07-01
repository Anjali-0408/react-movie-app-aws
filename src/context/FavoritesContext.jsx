import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState('');

  // ✅ Fetch favorites for specific user
  const fetchFavorites = async (uid) => {
    try {
      const listRes = await axios.get(
        'https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/list-fav',
        {
          headers: {
            'Content-Type': 'application/json',
            'user-id': uid, // ✅ Pass user_id in headers
          },
        }
      );

      const movieIds = listRes.data.favourites || [];

      const movieDetails = await Promise.all(
        movieIds.map(async (id) => {
          const res = await axios.get(
            `https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/get-movies?id=${id}`
          );
          return res.data;
        })
      );

      setFavorites(movieDetails);
    } catch (err) {
      console.error('❌ Error fetching favorites:', err);
    }
  };

  // ✅ Detect login/logout and update user & favorites
  useEffect(() => {
    const handleAuthChange = () => {
      const uid = localStorage.getItem('userId');
      if (uid && uid !== userId) {
        setUserId(uid);
        fetchFavorites(uid);
      } else if (!uid) {
        setUserId('');
        setFavorites([]);
      }
    };

    handleAuthChange(); // Initial load
    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, [userId]);

  // ✅ Add/remove movie from favorites
  const toggleFavorite = async (movie) => {
    const uid = localStorage.getItem('userId');
    if (!uid) {
      console.warn('🚫 No userId found in localStorage');
      return;
    }

    const movieId = movie.movie_id || movie.id;

    try {
      const res = await axios.post(
        `https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/toggle-fav?movie_id=${movieId}&user_id=${uid}`
      );

      const msg = res.data.message?.toLowerCase();

      if (msg?.includes('removed')) {
        setFavorites((prev) =>
          prev.filter((fav) => (fav.movie_id || fav.id) !== movieId)
        );
      } else if (msg?.includes('added')) {
        const newRes = await axios.get(
          `https://j3iy0jkh7i.execute-api.ap-south-1.amazonaws.com/get-movies?id=${movieId}`
        );
        setFavorites((prev) => [...prev, newRes.data]);
      }
    } catch (err) {
      console.error('❌ Error toggling favorite:', err);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
