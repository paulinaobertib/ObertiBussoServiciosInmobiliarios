import { useState, useEffect } from 'react';
import { Box, TextField, CircularProgress } from '@mui/material';
import { getPropertiesByText, getAllProperties } from '../../services/property.service';
import { Property } from '../../types/property';

interface Props {
  onSearch: (results: Property[]) => void;
  debounceMs?: number;
}

export const SearchBar = ({ onSearch, debounceMs = 300 }: Props) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        let results: Property[];

        if (query.trim() === '') {
          results = await getAllProperties();
        } else {
          results = await getPropertiesByText(query.trim());
        }

        onSearch(results);
      } catch (e) {
        console.error('Error en búsqueda en tiempo real:', e);
        onSearch([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, debounceMs, onSearch]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 1,
        p: 2,
        mb: 4,
      }}
    >
      <TextField
        placeholder="Buscar por título o descripción…"
        variant="outlined"
        fullWidth
        value={query}
        onChange={e => setQuery(e.target.value)}
        InputProps={{
          endAdornment: loading ? <CircularProgress size={20} /> : null
        }}
        sx={{
          maxWidth: '80%',
          backgroundColor: 'white'
        }}
      />
    </Box>
  );
}
