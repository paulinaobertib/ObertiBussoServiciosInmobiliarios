import { useState, useRef } from 'react';
import { Container, Box, Typography, IconButton, Button, useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotices } from '../../hooks/useNotices';
import { useAuthContext } from '../../context/AuthContext';
import { Modal } from '../../../shared/components/Modal';
import { NoticeForm, NoticeFormHandle } from './NoticeForm';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';

export const NoticeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('md'));
  const { notices, edit, remove } = useNotices();
  const { isAdmin } = useAuthContext();
  const [editOpen, setEditOpen] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const formRef = useRef<NoticeFormHandle>(null);
  const { ask, DialogUI } = useConfirmDialog();

  const notice = notices.find(n => n.id === Number(id));

  // Early return if not found
  if (!notice) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h6" align="center">
          Noticia no encontrada.
        </Typography>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </Box>
      </Container>
    );
  }

  // Image source
  const imageSrc = typeof notice.mainImage === 'string'
    ? notice.mainImage
    : notice.mainImage
      ? URL.createObjectURL(notice.mainImage)
      : '';

  // Handlers
  const openEdit = () => setEditOpen(true);
  const closeEdit = () => setEditOpen(false);

  const handleSave = async () => {
    if (!formRef.current) return;
    const data = formRef.current.getUpdateData();
    await edit({ ...(data as any), id: notice.id, userId: notice.userId });
    closeEdit();
  };

  const handleDelete = () =>
    ask('¿Eliminar esta novedad?', async () => {
      await remove(notice.id);
      navigate(-1);
    });

  const goBack = () => navigate(-1);

  return (
    <>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box display="flex" flexDirection={isSm ? 'column' : 'row'} gap={4} alignItems="flex-start">
          {/* Left column: Image */}
          <Box flex={1}>
            <Box
              component="img"
              src={imageSrc}
              alt={notice.title}
              sx={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', borderRadius: 2 }}
            />
          </Box>
          {/* Right column: Content */}
          <Box flex={1} display="flex" flexDirection="column">
            <Box display="flex" justifyContent="flex-end" mb={2}>
              {isAdmin && (
                <>
                  <IconButton size="small" onClick={openEdit} aria-label="Editar noticia">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={handleDelete} aria-label="Eliminar noticia">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
            <Typography variant="h4" gutterBottom>
              {notice.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {new Date(notice.date).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Typography>
            <Typography variant="body1" paragraph>
              {notice.description}
            </Typography>
            <Box mt="auto">
              <Button variant="outlined" onClick={goBack}>
                Volver
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
      {/* Edit Modal */}
      <Modal open={editOpen} title="Editar noticia" onClose={closeEdit}>
        <NoticeForm
          key={notice.id}
          ref={formRef}
          initialData={notice}
          onValidityChange={setCanSave}
        />
        <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
          <Button variant="contained" onClick={handleSave} disabled={!canSave}>
            Guardar
          </Button>
        </Box>
      </Modal>

      {DialogUI}
    </>
  );
}
