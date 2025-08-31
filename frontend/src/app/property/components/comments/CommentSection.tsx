import { useState } from 'react';
import { Box, Typography, Divider, CircularProgress } from '@mui/material';

import type { Comment } from '../../types/comment';
import { CommentForm } from '../forms/CommentForm';
import { CommentList } from './CommentList';
import { deleteComment } from '../../services/comment.service';

export interface Props {
  propertyId: number;
  loading: boolean;
  items: Comment[];
  refresh: () => Promise<void>;
  getUserName: (id: string) => string;
}

export const CommentSection = ({ propertyId, loading, items, refresh, getUserName, }: Props) => {
  const [action, setAction] = useState<'add' | 'edit'>('add');
  const [selected, setSelected] = useState<Comment>();

  const startEdit = (c: Comment) => {
    setAction('edit');
    setSelected(c);
  };

  const handleDelete = async (c: Comment) => {
    await deleteComment(c);
    await refresh();
  };
  const handleDone = () => {
    setAction('add');
    setSelected(undefined);
  };

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            {action === 'add' ? 'Agregar Comentario' : 'Editar Comentario'}
          </Typography>
        </Box>

        <CommentForm
          propertyId={propertyId}
          action={action}
          item={selected}
          refresh={refresh}
          onDone={handleDone}
        />
      </Box>

      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Lista de Comentarios ({items.length})
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <CommentList
            items={items}
            onEditItem={startEdit}
            onDeleteItem={handleDelete}
            getUserName={getUserName}
          />
        )}
      </Box>
    </Box>
  );
};
