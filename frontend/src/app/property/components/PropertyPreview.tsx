import { Box, Divider, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const toURL = (f: File) => URL.createObjectURL(f);

interface Props {
  main: File | null;
  images: File[];
  vertical?: boolean;
  onDelete?: (img: File) => void;
}

export default function PropertyPreview({ main, images, vertical = false, onDelete }: Props) {
  if (!(main instanceof File) && !images.some((img) => img instanceof File)) return null;

  const axis = vertical ? 'column' : 'row';

  const Thumb = ({ file }: { file: File }) => {
    if (!(file instanceof File)) return null;

    return (
      <Box sx={{ position: 'relative', flex: '0 0 auto', '&:hover .deleteBtn': { opacity: 1 } }}>
        <Box
          component="img"
          src={toURL(file)}
          sx={{
            width: vertical ? '100%' : 120,
            height: vertical ? 120 : '100%',
            objectFit: 'contain',
            borderRadius: 1,
            flexShrink: 0,
          }}
        />

        {onDelete && (
          <Tooltip title="Eliminar">
            <IconButton
              size="medium"
              className="deleteBtn"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                bgcolor: 'rgba(0,0,0,0.55)',
                color: '#fff',
                opacity: 0,
                transition: 'opacity .2s',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
              }}
              onClick={() => onDelete(file)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: axis,
        alignItems: 'center',
        gap: 1,
        height: '100%',
        minHeight: 0,
      }}
    >
      {main instanceof File && <Thumb file={main} />}

      {main instanceof File && images.length > 0 && (
        <Divider
          orientation={vertical ? 'horizontal' : 'vertical'}
          sx={{ bgcolor: 'black' }}
          flexItem
        />
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: axis,
          gap: 1,
          flexGrow: 1,
          minHeight: 0,
          overflowX: vertical ? 'hidden' : 'auto',
          overflowY: vertical ? 'auto' : 'hidden',
        }}
      >
        {images
          .filter((f) => f instanceof File)
          .map((f) => (
            <Thumb key={f.name} file={f} />
          ))}
      </Box>
    </Box>
  );
}
