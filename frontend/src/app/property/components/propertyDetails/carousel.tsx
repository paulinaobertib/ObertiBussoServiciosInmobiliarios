import { useState, useEffect } from 'react';
import { Box, IconButton, Paper, Chip, Typography, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getFullImageUrl } from '../../utils/getFullImageUrl';

interface Image {
  id: number;
  url: string;
}

interface ImageCarouselProps {
  images: Image[];
  mainImage: string;
  title: string;
}

const ImageCarousel = ({ images, mainImage, title }: ImageCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAllThumbnails, setShowAllThumbnails] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const allImages = [{ id: -1, url: mainImage }, ...images].filter(
    (img) => img.url
  );
  const visibleThumbnails = isMobile ? 3 : isTablet ? 4 : 5;

  const nextImage = () => {
    setActiveIndex((activeIndex + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveIndex((activeIndex - 1 + allImages.length) % allImages.length);
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (allImages.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % allImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [allImages.length]);

  return (
    <Box sx={{ width: '100%' }}>
      {allImages.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            height: isMobile ? '300px' : '450px',
            position: 'relative',
          }}
        >
          {allImages.map((image, index) => (
            <Box
              key={image.id}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: index === activeIndex ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
              }}
            >
              <img
                src={getFullImageUrl(image.url) || '/placeholder.svg'}
                alt={`Imagen ${index + 1} de ${title}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ))}
          <Chip
            label={`${activeIndex + 1}/${allImages.length}`}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: 'rgba(5, 5, 5, 0.6)',
              color: 'white',
              fontWeight: 'bold',
              zIndex: 1,
            }}
          />
          {allImages.length > 1 && (
            <>
              <IconButton
                onClick={prevImage}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 16,
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,1)',
                  },
                  boxShadow: 2,
                  zIndex: 1,
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                <ArrowBackIosNewIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
              <IconButton
                onClick={nextImage}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 16,
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgb(246, 246, 246)',
                  },
                  boxShadow: 2,
                  zIndex: 1,
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                <ArrowForwardIosIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </>
          )}
        </Paper>
      )}
      {/* Siempre renderizar el contenedor de miniaturas */}
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          minHeight: isMobile ? 60 : 80, // Reservar espacio para miniaturas
        }}
      >
        {allImages.length > 1 ? (
          (showAllThumbnails
            ? allImages
            : allImages.slice(0, visibleThumbnails)
          ).map((image, index) => (
            <Box
              key={index}
              onClick={() => handleThumbnailClick(index)}
              sx={{
                width: isMobile ? 60 : 80,
                height: isMobile ? 60 : 80,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border:
                  index === activeIndex
                    ? `2px solid ${theme.palette.primary.main}`
                    : '2px solid transparent',
                opacity: index === activeIndex ? 1 : 0.7,
                transition: 'all 0.2s',
                '&:hover': {
                  opacity: 1,
                },
                flexShrink: 0,
              }}
            >
              <img
                src={getFullImageUrl(image.url) || '/placeholder.svg'}
                alt={`Miniatura ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ))
        ) : (
          // Espacio vacío para mantener el layout
          <Box sx={{ width: '100%', height: isMobile ? 60 : 80 }} />
        )}
        {allImages.length > visibleThumbnails && !showAllThumbnails && (
          <Box
            onClick={() => setShowAllThumbnails(true)}
            sx={{
              width: isMobile ? 60 : 80,
              height: isMobile ? 60 : 80,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.2)',
              },
              flexShrink: 0,
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              +{allImages.length - visibleThumbnails}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ImageCarousel;