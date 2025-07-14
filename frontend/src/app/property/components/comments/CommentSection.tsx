import { Box, Typography, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CommentList } from './CommentList';
import { CommentData } from './CommentItem';

export interface CommentSectionProps {
  loading: boolean;
  items: CommentData[];
  onAdd: () => void;
  onEditItem: (item: CommentData) => void;
  onDeleteItem: (item: CommentData) => void;
}

export const CommentSection = ({
  loading,
  items,
  onAdd,
  onEditItem,
  onDeleteItem,
}: CommentSectionProps) => (
  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <Box
      sx={{
        px: 3,
        py: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Comentarios Internos
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
        Agregar
      </Button>
    </Box>

    <Box sx={{ px: 3, py: 2, flexGrow: 1, overflowY: 'auto' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Typography color="text.secondary">
          No hay comentarios registrados.
        </Typography>
      ) : (
        <CommentList items={items} onEditItem={onEditItem} onDeleteItem={onDeleteItem} />
      )}
    </Box>
  </Box>
);
