import React, { useState } from 'react';
import {
  Box, TextField, Button, FormControl, InputLabel, Select, useMediaQuery, Typography,
  Checkbox, FormControlLabel, Collapse
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';

const Home: React.FC = () => {
  const [filters, setFilters] = useState({
    precioDesde: '', precioHasta: '', tipoInmueble: '', ciudad: '',
    barrio: '', tipoBarrio: '', superficieDesde: '', superficieHasta: '',
    ambientes: '', servicios: '', operacion: '', banios: '', habitaciones: '',
    financiado: 'false', aptoCredito: 'false'
  });

  const [showFilters, setShowFilters] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [showPrecio, setShowPrecio] = useState(false);
  const [showSuperficie, setShowSuperficie] = useState(false);

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
    borderRadius: 1,
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  return (
    <Box sx={{ px: 4, pt: 0, pb: 4 }}>
      <Box
        sx={{
          width: isMobile ? '100%' : '260px',
          position: 'sticky',
          top: '0px',
          backgroundColor: '#fff',
          p: 2,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          boxShadow: 5,
          alignSelf: 'flex-start',
          [theme.breakpoints.down('md')]: {
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
              sx={{ mb: 0, width: '100%' }}
            >
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </Button>
          </Box>
        )}

        {(!isMobile || showFilters) && (
          <>
            <FormControl sx={{
              ...inputBoxStyle, py: 1, border: '2px solid #ccc', borderRadius: 1,
              '&:hover': {
                borderColor: '#444',
              },
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.aptoCredito === 'true'}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        aptoCredito: e.target.checked ? 'true' : 'false',
                      }))
                    }
                  />
                }
                label="Apto crédito"
                sx={{ pl: 2, color: '#727272' }}
              />
            </FormControl>

            <FormControl sx={{
              ...inputBoxStyle, py: 1, border: '2px solid #ccc', borderRadius: 1,
              '&:hover': {
                borderColor: '#444',
              },
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.financiado === 'true'}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        financiado: e.target.checked ? 'true' : 'false',
                      }))
                    }
                  />
                }
                label="Financiado"
                sx={{ pl: 2, color: '#727272' }}
              />
            </FormControl>

            <FormControl sx={inputBoxStyle}>
              <InputLabel>Tipo de inmueble</InputLabel>
              <Select name="tipoInmueble" value={filters.tipoInmueble} onChange={handleChange} label="Tipo de inmueble" />
            </FormControl>

            <FormControl sx={inputBoxStyle}>
              <Box
                sx={{
                  px: 0.9, py: 1.8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '2px solid #ccc', borderRadius: 1,
                  '&:hover': {
                    borderColor: '#444',
                  },
                }}
                onClick={() => setShowPrecio(!showPrecio)}
              >
                <Typography sx={{ color: '#666', ml: 0.7 }}>Precio (USD)</Typography>
                <ArrowDropDownIcon
                  sx={{
                    transform: showPrecio ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: '0.3s',
                    ml: 'auto',
                    color: '#727272',
                  }}
                />
              </Box>
              <Collapse in={showPrecio}>
                <Box sx={{ display: 'flex', gap: 2, px: 2, pb: 2, pt: 2 }}>
                  <TextField
                    name="precioDesde"
                    label="Desde"
                    type="number"
                    value={filters.precioDesde}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                    sx={{ ...numberInputStyles, flex: 1 }}
                  />
                  <TextField
                    name="precioHasta"
                    label="Hasta"
                    type="number"
                    value={filters.precioHasta}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                    sx={{ ...numberInputStyles, flex: 1 }}
                  />
                </Box>
              </Collapse>
            </FormControl>

            <FormControl sx={inputBoxStyle}>
              <Box
                sx={{
                  px: 1, py: 1.8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '2px solid #ccc', borderRadius: 1,
                  '&:hover': {
                    borderColor: '#444',
                  },
                }}
                onClick={() => setShowSuperficie(!showSuperficie)}
              >
                <Typography sx={{ color: '#666', ml: 0.7 }}>Superficie total (m²)</Typography>
                <ArrowDropDownIcon
                  sx={{
                    transform: showSuperficie ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: '0.3s',
                    ml: 'auto',
                    color: '#727272',
                  }}
                />
              </Box>
              <Collapse in={showSuperficie}>
                <Box sx={{ display: 'flex', gap: 2, px: 2, pb: 2, pt: 2 }}>
                  <TextField
                    name="superficieDesde"
                    label="Desde"
                    type="number"
                    value={filters.superficieDesde}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                    sx={{ ...numberInputStyles, flex: 1 }}
                  />
                  <TextField
                    name="superficieHasta"
                    label="Hasta"
                    type="number"
                    value={filters.superficieHasta}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                    sx={{ ...numberInputStyles, flex: 1 }}
                  />
                </Box>
              </Collapse>
            </FormControl>

            <FormControl sx={inputBoxStyle}>
              <InputLabel>Ciudad</InputLabel>
              <Select name="ciudad" value={filters.ciudad} onChange={handleChange} label="Ciudad" />
            </FormControl>

            <FormControl sx={inputBoxStyle}>
              <InputLabel>Tipo de barrio</InputLabel>
              <Select name="tipoBarrio" value={filters.tipoBarrio} onChange={handleChange} label="Tipo de barrio" />
            </FormControl>

            <FormControl sx={inputBoxStyle}>
              <InputLabel>Barrio</InputLabel>
              <Select name="barrio" value={filters.barrio} onChange={handleChange} label="Barrio" />
            </FormControl>

            <FormControl sx={inputBoxStyle}>
              <InputLabel>Cantidad de ambientes</InputLabel>
              <Select name="ambientes" value={filters.ambientes} onChange={handleChange} label="Cantidad de ambientes" />
            </FormControl>

            <TextField
              name="banios"
              label="Cantidad de baños"
              type="number"
              value={filters.banios || ''}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              sx={{ ...inputBoxStyle, ...numberInputStyles }}
            />

            <TextField
              name="habitaciones"
              label="Cantidad de habitaciones"
              type="number"
              value={filters.habitaciones || ''}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              sx={{ ...inputBoxStyle, ...numberInputStyles }}
            />

            <FormControl sx={inputBoxStyle}>
              <InputLabel>Servicios</InputLabel>
              <Select name="servicios" value={filters.servicios} onChange={handleChange} label="Servicios" />
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