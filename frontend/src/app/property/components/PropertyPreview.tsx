import { Box, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Image } from '../types/image';

const toSrc = (p: Image) =>
  typeof p === 'string' ? p : URL.createObjectURL(p);

interface Props {
  main: Image | null;
  images: Image[];
  onDelete?: (img: Image) => void;
}

export default function PropertyPreview({ main, images, onDelete }: Props) {
  if (!main && images.length === 0) return null;

  const Thumb = ({ file, isMain }: { file: Image; isMain: boolean }) => (
    <Box
      sx={{
        position: 'relative',
        maxWidth: 100,
        aspectRatio: '1',
        border: isMain ? '3px solid #EF6C00' : '1px solid #ccc',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover .deleteBtn': { opacity: 1, pointerEvents: 'auto' },
      }}
    >
      <Box
        component="img"
        src={toSrc(file)}
        sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
      />

      {isMain && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
            bgcolor: '#EF6C00',
            color: '#fff',
            px: 1,
            py: 0.2,
            borderRadius: 1,
            fontSize: '0.7rem',
            fontWeight: 700,
          }}
        >
          Principal
        </Box>
      )}

      {onDelete && (
        <Tooltip title="Eliminar">
          <IconButton
            size="small"
            onClick={() => onDelete(file)}
            className="deleteBtn"
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: '#fff',
              opacity: 0,
              pointerEvents: 'none',
              transition: 'opacity 0.2s',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1, overflowY: 'auto' }}>
      {[main, ...images]
        .filter((f): f is Image => f != null)
        .map((f) => (
          <Thumb
            key={typeof f === 'string' ? f : f.name}
            file={f}
            isMain={f === main}
          />
        ))}
    </Box>
  );
}
