import React from 'react';
import { Box } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import carrusel1 from '../../../assets/carrusel1.jpg';
import carrusel2 from '../../../assets/carrusel2.jpg';
import carrusel3 from '../../../assets/carrusel3.jpg';
import logo from '../../../assets/logoJPG.png';

const carouselImages = [carrusel1, carrusel2, carrusel3];


const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 600,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: false,
};

const ImageCarousel: React.FC = () => {
  return (
    <Box sx={{position: 'relative', height: '350px', mb: 4 }}>
      <Slider {...sliderSettings}>
        {carouselImages.map((img, idx) => (
          <Box
            key={idx}
            sx={{
              position: 'relative',
              height: '350px',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <img
              src={img}
              alt={`Slide ${idx + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        ))}
      </Slider>

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(200, 200, 200, 0.5)',
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          '@media (max-width: 1200px)': { width: '90%' },
          '@media (max-width: 900px)': { width: '80%' },
          '@media (max-width: 600px)': { width: '70%' },
          pointerEvents: 'none',
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            width: '100%',
            height: 'auto',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))',
          }}
        />
      </Box>
    </Box>
  );
};

export default ImageCarousel;
