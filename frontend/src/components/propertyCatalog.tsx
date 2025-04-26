import React from 'react';
import { Box, Typography, Card, CardMedia, CardContent } from '@mui/material';
import carrusel1 from '../assets/carrusel1.jpg';
import carrusel2 from '../assets/carrusel2.jpg';
import carrusel3 from '../assets/carrusel3.jpg';

const properties = [
  { id: 1, title: 'CASA', price: 325000, img: carrusel1 },
  { id: 2, title: 'CASA', price: 400000, img: carrusel2 },
  { id: 3, title: 'CABAÑA', price: 135000, img: carrusel3 },
  { id: 4, title: 'DÚPLEX AMPLIO', price: 250000, img: carrusel1 },
  { id: 5, title: 'TERRENO', price: 430000, img: carrusel2 },
  { id: 6, title: 'DEPARTAMENTO', price: 250000, img: carrusel3 },
  { id: 7, title: 'GALPÓN INDUSTRIAL', price: 155000, img: carrusel1 },
  { id: 8, title: 'OFICINA', price: 44000, img: carrusel2 },
  { id: 9, title: 'LOFT MODERNO', price: 275000, img: carrusel3 },
  { id: 10, title: 'PH CON PATIO', price: 310000, img: carrusel1 },
  { id: 11, title: 'CASA DE CAMPO', price: 195000, img: carrusel2 },
  { id: 12, title: 'LOCAL COMERCIAL', price: 225000, img: carrusel3 },
];

const Home: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3,
        '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
        '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
        '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
      }}>
        {properties.map(property => (
          <Card
            key={property.id}
            sx={{
              height: 280,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: 2,
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 4,
                zIndex: 1,
              },
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image={property.img}
              alt={property.title}
              sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
            />
            <CardContent
              sx={{
                textAlign: 'center',
                backgroundColor: '#fed7aa',
                flexGrow: 1,
                padding: '15px',
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