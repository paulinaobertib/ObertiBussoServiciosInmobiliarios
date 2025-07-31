import { useState, useRef } from 'react';
import { Box, Typography, Button, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { buildRoute, ROUTES } from '../../../../lib';
import { Modal } from '../../../shared/components/Modal';
import { NoticeForm, NoticeFormHandle } from './NoticeForm';
import type { Notice } from '../../types/notice';

interface Props {
  notice: Notice;
  isAdmin?: boolean;
  onUpdate: (n: Notice) => Promise<void>;
  onDeleteClick?: (id: number) => void;
}

export const NoticeItem = ({ notice, isAdmin = false, onUpdate, onDeleteClick }: Props) => {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const formRef = useRef<NoticeFormHandle>(null);

  const imageSrc =
    typeof notice.mainImage === 'string'
      ? notice.mainImage
      : notice.mainImage
        ? URL.createObjectURL(notice.mainImage)
        : '';

  const isNew =
    Date.now() - new Date(notice.date).getTime() <
    3 * 24 * 60 * 60 * 1000; // últimos 3 días

  const formattedDate = new Date(notice.date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const goToDetails = () =>
    navigate(buildRoute(ROUTES.NEWS_DETAILS, notice.id));

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditOpen(true);
  };
  const closeEdit = () => setEditOpen(false);

  const handleSave = async () => {
    if (!formRef.current) return;
    const data = formRef.current.getUpdateData();
    await onUpdate({ ...(data as Notice), id: notice.id, userId: notice.userId });
    closeEdit();
  };

  return (
    <>
      <Box
        onClick={goToDetails}
        sx={{
          width: '100%',
          minWidth: 0,
          borderRadius: 2,
          overflow: 'hidden',
          flexShrink: 0,
          bgcolor: 'background.paper',
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          mb: 1,
        }}
      >
        {/* HEADER: chip + fecha + autor si es admin + botones */}
        <Box
          sx={{
            px: 1,
            pt: 1,
            pb: isAdmin ? 0.5 : 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Izquierda: chip + fecha */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              {isNew && (
                <Chip
                  label="NUEVO"
                  size="small"
                  color="default"
                  sx={{
                    color: 'inherit',
                    bgcolor: 'quaternary.main',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                  }}
                />
              )}
              {isNew && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formattedDate}
                </Typography>
              )}
            </Box>

            {/* Derecha: botones admin */}
            {isAdmin && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" onClick={openEdit}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick?.(notice.id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

        </Box>

        {/* IMAGEN 9:16 */}
        <Box
          sx={{
            width: '100%',
            aspectRatio: '9/16',
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* FOOTER */}
        <Box sx={{ px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              height: '2.5em',
            }}
          >
            {notice.title}
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={goToDetails}
            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
          >
            Leer más
          </Button>
        </Box>
      </Box>

      {/* MODAL EDICIÓN */}
      <Modal open={editOpen} title="Editar novedad" onClose={closeEdit}>
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
    </>
  );
}
