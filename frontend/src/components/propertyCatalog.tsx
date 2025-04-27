import React from 'react';
import { Box, Typography, Card, CardMedia, CardContent, Chip } from '@mui/material';
import carrusel1 from '../assets/carrusel1.jpg';
import carrusel2 from '../assets/carrusel2.jpg';
import carrusel3 from '../assets/carrusel3.jpg';

const properties = [
  { id: 1, title: 'CASA', price: 325000, img: carrusel1, status: 'Disponible' },
  { id: 2, title: 'CASA', price: 400000, img: carrusel2, status: 'Reservada' },
  { id: 3, title: 'CABAÑA', price: 135000, img: carrusel3, status: 'Vendida' },
  { id: 4, title: 'DÚPLEX AMPLIO', price: 250000, img: carrusel1, status: 'Alquilada' },
  { id: 5, title: 'TERRENO', price: 430000, img: carrusel2, status: 'Disponible' },
  { id: 6, title: 'DEPARTAMENTO', price: 250000, img: carrusel3, status: 'Reservada' },
  { id: 7, title: 'GALPÓN INDUSTRIAL', price: 155000, img: carrusel1, status: 'Disponible' },
  { id: 8, title: 'OFICINA', price: 44000, img: carrusel2, status: 'Vendida' },
  { id: 9, title: 'LOFT MODERNO', price: 275000, img: carrusel3, status: 'Disponible' },
  { id: 10, title: 'PH CON PATIO', price: 310000, img: carrusel1, status: 'Reservada' },
  { id: 11, title: 'CASA DE CAMPO', price: 195000, img: carrusel2, status: 'Alquilada' },
  { id: 12, title: 'LOCAL COMERCIAL', price: 225000, img: carrusel3, status: 'Disponible' },
];

const Home: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',       // 1 columna en pantallas pequeñas
            sm: 'repeat(2, 1fr)',  // 2 columnas en pantallas medianas
            md: 'repeat(3, 1fr)',  // 3 columnas en pantallas grandes
          },
          gap: 3,
        }}
      >
        {properties.map((property) => (
          <Card
            key={property.id}
            sx={{
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: 2,
              position: 'relative',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4,
                zIndex: 1,
              },
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="250"
                image={property.img}
                alt={property.title}
                sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
              />
              <Chip
                label={property.status}
                color="default"
                size="medium"
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  fontWeight: 'bold',
                  fontSize: { xs: '12px', sm: '17px' },
                  borderRadius: 3,
                  boxShadow: 3,
                  backgroundColor: '#e0e0e0',
                  color: '#0a0a0a',
                }}
              />
            </Box>

            <CardContent
              sx={{
                textAlign: 'center',
                backgroundColor: '#fed7aa',
                flexGrow: 1,
                padding: { xs: 1, sm: 2 },
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                {property.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ${property.price.toLocaleString()} USD
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Home;
