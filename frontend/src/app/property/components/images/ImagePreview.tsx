// src/app/shared/components/PropertyPreview.tsx
import { Box, IconButton, Tooltip, useTheme, Dialog } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import { Image } from '../../types/image';
import { useState } from 'react';

const toSrc = (p: Image) => (typeof p === 'string' ? p : URL.createObjectURL(p));

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

  const openLightbox = (img: Image) => {
    setSelected(img);
    setLightboxOpen(true);
  };
  const closeLightbox = () => {
    setSelected(null);
    setLightboxOpen(false);
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
        {items.map(file => {
          const src = toSrc(file);
          const isVideo =
            (file instanceof File && file.type.startsWith('video/'))
            || (typeof file === 'string' && /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(file)); const key = typeof file === 'string' ? file : file.name;

          return (
            <Box
              key={key}
              onClick={() => openLightbox(file)}
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '100%',
                borderRadius: 1,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                },
                '&:hover .deleteBtn': {
                  opacity: 1,
                  pointerEvents: 'auto',
                },
              }}
            >
              {isVideo ? (
                <video
                  src={src}
                  muted
                  loop
                  playsInline
                  autoPlay
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onContextMenu={e => e.preventDefault()}
                />
              ) : (
                <Box
                  component="img"
                  src={src}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}

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

              {onDelete && (
                <Tooltip title="Eliminar">
                  <IconButton
                    className="deleteBtn"
                    onClick={e => { e.stopPropagation(); onDelete(file); }}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      color: theme.palette.primary.main,
                      p: 0,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      pointerEvents: 'none',
                    }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          );
        })}
      </Box>

      <Dialog
        open={lightboxOpen}
        onClose={closeLightbox}
        maxWidth="lg"
        PaperProps={{ sx: { backgroundColor: 'transparent', boxShadow: 'none', m: 0, p: 0 } }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={closeLightbox}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              zIndex: 1,
              p: 0.5,
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>

          {selected && (() => {
            const src = toSrc(selected);
            if (
              (selected instanceof File && selected.type.startsWith('video/'))
              || (typeof selected === 'string' && /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(selected))
            ) {
              return (
                <video
                  src={src}
                  muted
                  loop
                  playsInline
                  autoPlay
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                    cursor: 'default',
                  }}
                  onContextMenu={e => e.preventDefault()}
                />
              );
            }
            return (
              <Box
                component="img"
                src={src}
                sx={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
            );
          })()}
        </Box>
      </Dialog>
    </>
  );
};
