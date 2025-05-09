import React, { useState } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, useMediaQuery } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';

const Home: React.FC = () => {
  const [filters, setFilters] = useState({
    precioDesde: '', precioHasta: '', tipoInmueble: '', ciudad: '',
    barrio: '', tipoBarrio: '', superficieDesde: '', superficieHasta: '',
    ambientes: '', servicios: '', operacion: '', banios: '', habitaciones: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); 

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name as string]: value }));
  };

  const numberInputStyles = {
    '& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    '& input[type=number]': {
      MozAppearance: 'textfield',
    },
  };

  const inputBoxStyle = {
    width: '100%',
    boxShadow: 1,
    backgroundColor: '#f9f9f9',
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  return (
    <Box sx={{ px: 4, pt: 2, pb: 4 }}>
      <Box
        sx={{
          width: '260px',
          position: 'sticky',
          top: '20px',
          backgroundColor: '#fff',
          p: 2,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          boxShadow: 5,
          alignSelf: 'flex-start',
          [theme.breakpoints.down('md')]: {
            width: '100%',
            position: 'relative',
            top: 'unset',
            marginLeft: '-16px',
          },
        }}
      >
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button
              onClick={toggleFilters}
              variant="contained"
              sx={{ mb: 0, width: '260px' }}
            >
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </Button>
          </Box>
        )}

        {(!isMobile || showFilters) && (
          <>
            <FormControl sx={inputBoxStyle}>
              <InputLabel>Tipo de inmueble</InputLabel>
              <Select name="tipoInmueble" value={filters.tipoInmueble} onChange={handleChange} label="Tipo de inmueble">
              </Select>
            </FormControl>

            <TextField name="precioDesde" label="Precio desde: (USD)" type="number" value={filters.precioDesde} onChange={handleChange} inputProps={{ min: 0 }} sx={{ ...inputBoxStyle, ...numberInputStyles }} />
            <TextField name="precioHasta" label="Precio hasta: (USD)" type="number" value={filters.precioHasta} onChange={handleChange} inputProps={{ min: 0 }} sx={{ ...inputBoxStyle, ...numberInputStyles }} />

            <FormControl sx={inputBoxStyle}>
              <InputLabel>Ciudad</InputLabel>
              <Select name="ciudad" value={filters.ciudad} onChange={handleChange} label="Ciudad">
              </Select>
            </FormControl>

            <FormControl sx={inputBoxStyle}>
              <InputLabel>Tipo de barrio</InputLabel>
              <Select name="tipoBarrio" value={filters.tipoBarrio} onChange={handleChange} label="Tipo de barrio">
              </Select>
            </FormControl>

            <FormControl sx={inputBoxStyle}>
              <InputLabel>Barrio</InputLabel>
              <Select name="barrio" value={filters.barrio} onChange={handleChange} label="Barrio">
              </Select>
            </FormControl>

            <TextField name="superficieDesde" label="Superficie total desde: (m²)" type="number" value={filters.superficieDesde} onChange={handleChange} inputProps={{ min: 0 }} sx={{ ...inputBoxStyle, ...numberInputStyles }} />
            <TextField name="superficieHasta" label="Superficie total hasta: (m²)" type="number" value={filters.superficieHasta} onChange={handleChange} inputProps={{ min: 0 }} sx={{ ...inputBoxStyle, ...numberInputStyles }} />

            <FormControl sx={inputBoxStyle}>
              <InputLabel>Cantidad de ambientes</InputLabel>
              <Select name="ambientes" value={filters.ambientes} onChange={handleChange} label="Cantidad de ambientes">
              </Select>
            </FormControl>

            <TextField name="banios" label="Cantidad de baños" type="number" value={filters.banios || ''} onChange={handleChange} inputProps={{ min: 0 }} sx={{ ...inputBoxStyle, ...numberInputStyles }} />

            <TextField name="habitaciones" label="Cantidad de habitaciones" type="number" value={filters.habitaciones || ''} onChange={handleChange} inputProps={{ min: 0 }} sx={{ ...inputBoxStyle, ...numberInputStyles }} />

            <FormControl sx={inputBoxStyle}>
              <InputLabel>Servicios</InputLabel>
              <Select name="servicios" value={filters.servicios} onChange={handleChange} label="Servicios">
              </Select>
            </FormControl>

            <Button variant="contained" color="primary" size="large" sx={{ width: '100%' }}>
              Buscar
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Home;

