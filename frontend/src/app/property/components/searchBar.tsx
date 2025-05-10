import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

const SearchBar: React.FC = () => {
  const [search, setSearch] = useState('');

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', padding: '16px 32px', mb: 4 }}>
      <TextField
        placeholder="Buscar"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          maxWidth: 600,
          backgroundColor: '#f0f0f0',
          '& .MuiInputBase-root': { color: '#333' },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#ddd' },
            '&:hover fieldset': { borderColor: '#bbb' },
            '&.Mui-focused fieldset': { borderColor: '#bbb' },
          },
          '& input::placeholder': { color: '#666', opacity: 1 },
        }}
      />
      <Button variant="contained" color="primary" sx={{ marginLeft: 2 }}>
        Buscar
      </Button>
    </Box>
  );
};

export default SearchBar;