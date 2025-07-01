import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { SearchProvider } from './context/SearchContext';
import { GenreProvider } from './context/GenreContext'; // ✅

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SearchProvider>
      <GenreProvider>
        <App />
      </GenreProvider>
    </SearchProvider>
  </StrictMode>
);
