import { useState, useRef, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Card,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotices } from '../../hooks/useNotices';
import { useAuthContext } from '../../context/AuthContext';
import { Modal } from '../../../shared/components/Modal';
import { NoticeForm, NoticeFormHandle } from './NoticeForm';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { LoadingButton } from '@mui/lab';
import { EmptyState } from '../../../shared/components/EmptyState';

export const NoticeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notices, edit, remove, loading, error } = useNotices();
  const { isAdmin } = useAuthContext();
  const { ask, DialogUI } = useConfirmDialog();
  const [editOpen, setEditOpen] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<NoticeFormHandle>(null);

  const notice = useMemo(
    () => notices.find((n) => n.id === Number(id)),
    [notices, id]
  );

  if (loading && !notice) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  if (!notice) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
        <EmptyState
          title="No encontramos esta noticia."
          tone={error ? 'error' : 'neutral'}
        />
        <Box display="flex" justifyContent="center" mt={3}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </Box>
      </Container>
    );
  }

  const imageSrc = typeof notice.mainImage === 'string'
    ? notice.mainImage
    : notice.mainImage
      ? URL.createObjectURL(notice.mainImage)
      : '';

  const formattedDate = new Date(notice.date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const isRecent = Date.now() - new Date(notice.date).getTime() < 3 * 24 * 60 * 60 * 1000;

  const openEdit = () => setEditOpen(true);
  const closeEdit = () => setEditOpen(false);

  const handleSave = async () => {
    if (!formRef.current || saving) return;
    const data = formRef.current.getUpdateData();

    setSaving(true);
    await new Promise(requestAnimationFrame);
    try {
      await edit({ ...(data as any), id: notice.id, userId: notice.userId });
      closeEdit();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () =>
    ask('¿Eliminar esta novedad?', async () => {
      await remove(notice.id);
      navigate(-1);
    });

  const goBack = () => navigate(-1);

  return (
    <>
      <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
        <Card
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'relative', flexBasis: { md: '45%' }, flexShrink: 0 }}>
            <Box
              component="img"
              src={imageSrc || undefined}
              alt={notice.title}
              sx={{
                width: '100%',
                height: { xs: 320, sm: 400, md: '100%' },
                objectFit: 'cover',
                backgroundColor: 'action.hover',
              }}
            />

            {isRecent && (
              <Chip
                label="NUEVO"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  bgcolor: 'quaternary.main',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              />
            )}

            {isAdmin && (
              <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={openEdit}
                  size="small"
                  aria-label="Editar noticia"
                  sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.6)',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.8)' },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={handleDelete}
                  size="small"
                  aria-label="Eliminar noticia"
                  sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.6)',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.8)' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              p: { xs: 3, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {formattedDate}
            </Typography>

            <Typography variant="h4" fontWeight={700}>
              {notice.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.primary',
                whiteSpace: 'pre-line',
                lineHeight: 1.6,
              }}
            >
              {notice.description}
            </Typography>

            <Box display="flex" justifyContent="flex-end" mt="auto">
              <Button variant="outlined" onClick={goBack}>
                Volver
              </Button>
            </Box>
          </Box>
        </Card>
      </Container>

      <Modal open={editOpen} title="Editar noticia" onClose={closeEdit}>
        <NoticeForm
          key={notice.id}
          ref={formRef}
          initialData={notice}
          onValidityChange={setCanSave}
        />
        <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
          <LoadingButton variant="contained" onClick={handleSave} disabled={!canSave} loading={saving}>
            Guardar
          </LoadingButton>
        </Box>
      </Modal>

      {DialogUI}
    </>
  );
};
