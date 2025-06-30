import { useState, useEffect } from 'react';
import { Box, TextField, CircularProgress } from '@mui/material';

type SearchBarProps = {
  fetchAll: () => Promise<any[]>;
  fetchByText: (q: string) => Promise<any[]>;
  onSearch: (results: any[]) => void;
  placeholder?: string;
  debounceMs?: number;
};

export const SearchBar = ({
  fetchAll,
  fetchByText,
  onSearch,
  placeholder = 'Buscar…',
  debounceMs = 300,
}: SearchBarProps) => {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const fn = q.trim() ? () => fetchByText(q.trim()) : fetchAll;
      fn()
        .then(onSearch)
        .catch(() => onSearch([]))
        .finally(() => setLoading(false));
    }, debounceMs);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <Box display="flex" alignItems="center" width="50%">
      <TextField
        size="small"
        fullWidth
        placeholder={placeholder}
        value={q}
        onChange={e => setQ(e.target.value)}
        InputProps={{
          endAdornment: (
            <CircularProgress
              size={18}
              sx={{
                visibility: loading ? 'visible' : 'hidden',
                width: 18,
                height: 18,
              }}
            />
          ),
        }}
      />
    </Box>
  );
};
