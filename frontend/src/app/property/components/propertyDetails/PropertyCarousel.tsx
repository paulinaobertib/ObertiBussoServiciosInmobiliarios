import { useState, useEffect } from 'react';
import { Box, IconButton, Paper, Chip, Typography, useTheme, useMediaQuery } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getFullImageUrl } from '../../utils/getFullImageUrl';

interface Image { id: number; url: string }
interface Props {
  images: Image[];      // galería SIN la principal
  mainImage: string;    // url principal
  title: string;
}

// Carrusel que soporta imágenes y vídeos
export const PropertyCarousel = ({ images, mainImage, title }: Props) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const tablet = useMediaQuery(theme.breakpoints.down('lg'));

  // evita duplicados
  const all = [mainImage, ...images.map(i => i.url)]
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .map((url, id) => ({ id, url }));

  const [idx, setIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const thumbs = mobile ? 3 : tablet ? 3 : 3;
  const next = () => setIdx((idx + 1) % all.length);
  const prev = () => setIdx((idx - 1 + all.length) % all.length);

  useEffect(() => {
    if (all.length > 1) {
      const t = setInterval(() => setIdx(i => (i + 1) % all.length), 3500);
      return () => clearInterval(t);
    }
  }, [all.length]);

  const isVideo = (url: string) =>
    /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Slide */}
      {all.length > 0 && (
        <Paper elevation={3}
          sx={{
            borderRadius: 2, overflow: 'hidden',
            height: mobile ? 300 : 450, position: 'relative'
          }}>
          {all.map((img, i) => (
            <Box key={img.id} sx={{
              position: 'absolute', inset: 0,
              opacity: i === idx ? 1 : 0, transition: 'opacity .5s'
            }}>
              {isVideo(img.url) ? (
                <video src={getFullImageUrl(img.url)}
                  muted autoPlay loop playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src={getFullImageUrl(img.url) || '/placeholder.svg'}
                  alt={`Imagen ${i + 1} de ${title}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </Box>
          ))}
          <Chip label={`${idx + 1}/${all.length}`} size="small"
            sx={{
              position: 'absolute', bottom: 16, right: 16,
              bgcolor: 'rgba(5,5,5,.6)', color: '#fff', fontWeight: 'bold'
            }} />
          {all.length > 1 && (
            <>
              <IconButton
                aria-label="Imagen anterior"
                onClick={prev}
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
                size={mobile ? 'small' : 'medium'}
              >
                <ArrowBackIosNewIcon fontSize={mobile ? 'small' : 'medium'} />
              </IconButton>
              <IconButton
                aria-label="Siguiente imagen"
                onClick={next}
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
                size={mobile ? 'small' : 'medium'}
              >
                <ArrowForwardIosIcon fontSize={mobile ? 'small' : 'medium'} />
              </IconButton>
            </>
          )}
        </Paper>
      )}

      {/* Miniaturas */}
      <Box sx={{
        mt: 2, display: 'flex', gap: 1, overflowX: 'auto',
        minHeight: mobile ? 60 : 80
      }}>
        {(showAll ? all : all.slice(0, thumbs)).map((img, i) => (
          <Box key={img.id} onClick={() => setIdx(i)}
            sx={{
              width: mobile ? 60 : 80, height: mobile ? 60 : 80, borderRadius: 1,
              overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
              border: i === idx ? `2px solid ${theme.palette.primary.main}`
                : '2px solid transparent',
              opacity: i === idx ? 1 : .7, transition: 'all .2s',
              '&:hover': { opacity: 1 }
            }}>
            {isVideo(img.url) ? (
              <video src={getFullImageUrl(img.url)}
                muted autoPlay loop playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={getFullImageUrl(img.url) || '/placeholder.svg'}
                alt={`Miniatura ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </Box>
        ))}
        {all.length > thumbs && !showAll && (
          <Box onClick={() => setShowAll(true)}
            sx={{
              width: mobile ? 60 : 80, height: mobile ? 60 : 80, borderRadius: 1,
              bgcolor: 'rgba(0,0,0,.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,.2)' }, flexShrink: 0
            }}>
            <Typography variant="body2" fontWeight="bold">
              +{all.length - thumbs}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
