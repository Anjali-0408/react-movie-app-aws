import { createContext, useState } from 'react';

export const GenreContext = createContext();

export const GenreProvider = ({ children }) => {
  const [selectedGenreId, setSelectedGenreId] = useState('');

  return (
    <GenreContext.Provider value={{ selectedGenreId, setSelectedGenreId }}>
      {children}
    </GenreContext.Provider>
  );
};
