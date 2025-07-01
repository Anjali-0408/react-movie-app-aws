// src/context/SearchContext.jsx
import React, { createContext, useState } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, selectedGenre, setSelectedGenre }}>
      {children}
    </SearchContext.Provider>
  );
};
