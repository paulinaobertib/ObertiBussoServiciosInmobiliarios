import { Box, IconButton, Tooltip, useTheme, Dialog } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import { Image } from '../../types/image';
import { useState } from 'react';

const toSrc = (p: Image) => typeof p === 'string' ? p : URL.createObjectURL(p);

interface Props {
  main: Image | null;
  images: Image[];
  onDelete?: (img: Image) => void;
}

export const PropertyPreview = ({ main, images, onDelete }: Props) => {
  const theme = useTheme();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selected, setSelected] = useState<Image | null>(null);
  const uniq = <T,>(arr: T[]) => [...new Map(arr.map(v => [v, v])).values()];

  const items = uniq([main, ...images].filter((f): f is Image => f != null));

  const handleOpen = (img: Image) => {
    setSelected(img);
    setLightboxOpen(true);
  };

  const handleClose = () => {
    setLightboxOpen(false);
    setSelected(null);
  };

  if (!main && images.length === 0) return null;

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 1,
          p: 1,
          overflowY: 'auto',
        }}
      >
        {items.map((file) => (
          <Box
            key={typeof file === 'string' ? file : file.name}
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '100%', // Aspect ratio 1:1
              borderRadius: 1,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 1,
              transition: 'border-color 0.2s, box-shadow 0.2s',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                boxShadow: 3,
              },
              '&:hover .deleteBtn': {
                opacity: 1,
                pointerEvents: 'auto',
              },
            }}
          >
            <Box
              component="img"
              src={toSrc(file)}
              onClick={() => handleOpen(file)}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Star for main */}
            {file === main && (
              <StarIcon
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  color: theme.palette.primary.main,
                  fontSize: 20,
                  borderRadius: '50%',
                  p: 0.5,
                }}
              />
            )}

            {/* Delete button */}
            {onDelete && (
              <Tooltip title="Eliminar">
                <IconButton
                  className="deleteBtn"
                  onClick={() => onDelete(file)}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    color: theme.palette.primary.main,
                    p: 0.5,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    pointerEvents: 'none',
                  }}
                  size="small"
                >
                  <CancelIcon fontSize="inherit" sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ))}
      </Box>

      <Dialog
        open={lightboxOpen}
        onClose={handleClose}
        maxWidth="lg"
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            m: 0,
            p: 0,
            overflow: 'hidden',
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Close button encima de la imagen */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.4)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
              p: 0.5,
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>

          {selected && (
            <Box
              component="img"
              src={toSrc(selected)}
              sx={{
                display: 'block',
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Dialog>
    </>

  );
}
