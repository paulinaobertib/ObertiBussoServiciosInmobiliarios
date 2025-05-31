import { useState, useEffect } from 'react';
import { TextField, CircularProgress } from '@mui/material';
import { getOwnersByText, getAllOwners } from '../services/owner.service';
import { Owner } from '../types/owner';

interface Props {
  onSearch: (results: Owner[]) => void;
  debounceMs?: number;
}

export default function SearchBarOwner({ onSearch, debounceMs = 300 }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        let results: Owner[];

        if (query.trim() === '') {
          results = await getAllOwners();
        } else {
          results = await getOwnersByText(query.trim());
        }
        onSearch(results);
      } catch (e) {
        console.error('Error en búsqueda de propietarios:', e);
        onSearch([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, debounceMs, onSearch]);

  return (
    <TextField
      size="small"
      placeholder="Buscar propietario…"
      value={query}
      onChange={e => setQuery(e.target.value)}
      InputProps={{
        endAdornment: loading ? <CircularProgress size={18} /> : null,
      }}
      sx={{
        minWidth: '250px',
        backgroundColor: '#f8f8f8',
        mr: 2,
      }}
    />
  );
}