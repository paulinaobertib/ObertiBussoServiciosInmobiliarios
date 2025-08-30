import { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Button, IconButton, useMediaQuery, useTheme } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { SearchBar } from '../../../shared/components/SearchBar';
import { useNotices } from '../../hooks/useNotices';
import { useAuthContext } from '../../../user/context/AuthContext';
import { Modal } from '../../../shared/components/Modal';
import { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { NoticeForm, NoticeFormHandle } from './NoticeForm';
import { NoticesList } from './NoticesList';
import { LoadingButton } from '@mui/lab';

export default function NoticesSection() {
  /* ───────────── datos del hook ───────────── */
  const { notices, add, edit, remove, fetchAll, search, loading } = useNotices();
  const { isAdmin, info } = useAuthContext();


  /* ───────────── lógica de slider ───────────── */
  const sorted = useMemo(
    () => [...notices].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
    [notices],
  );

  const muiTheme = useTheme();
  const xs = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const sm = useMediaQuery(muiTheme.breakpoints.between('sm', 'md'));
  const md = useMediaQuery(muiTheme.breakpoints.between('md', 'lg'));
  const lg = useMediaQuery(muiTheme.breakpoints.between('lg', 'xl'));
  const visibleCount = xs ? 1 : sm ? 2 : md ? 3 : lg ? 4 : 5;

  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [sorted, visibleCount]);
  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(sorted.length - visibleCount, i + 1));
  const visibleNotices = useMemo(
    () => sorted.slice(idx, idx + visibleCount),
    [sorted, idx, visibleCount],
  );

  /* ───────────── modal crear / confirmar ───────────── */
  const [createOpen, setCreateOpen] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const formRef = useRef<NoticeFormHandle>(null);
  const { ask, DialogUI } = useConfirmDialog();

  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  const handleCreate = async () => {
    if (!formRef.current) return;
    const data = formRef.current.getCreateData();
    await add({ ...data, userId: info!.id });
    closeCreate();
  };

  const handleDelete = (id: number) =>
    ask('¿Eliminar esta novedad?', () => remove(id));

  /* ───────────── render ───────────── */
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">

      {/* BUSCADOR + CREAR */}
      <Box
        sx={{
          mt: 4,
          mb: 4,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, maxWidth: 480 }}>
          <SearchBar
            fetchAll={fetchAll}
            fetchByText={search}
            onSearch={() => { }}
            placeholder="Buscar novedades…"
          />
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            onClick={openCreate}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Nueva noticia
          </Button>
        )}
      </Box>

      {/* SLIDER */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          py: 2,
          overflow: 'visible', // permite que las flechas “salgan” a los costados
        }}
      >
        {/* Flecha Izquierda */}
        <IconButton
          onClick={prev}
          disabled={idx === 0 || sorted.length === 0}
          sx={{
            position: 'absolute',
            top: '50%',
            left: 0,                     // en xs queda adentro, en sm+ pega al borde
            transform: {
              xs: 'translateY(-50%)',                    // xs: no la sacamos
              sm: 'translate(-100%, -50%)',              // sm+: la empujamos al gutter
            },
            zIndex: 2,
            bgcolor: 'background.paper',
            boxShadow: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Contenedor de cards */}
        <NoticesList
          notices={visibleNotices}
          isAdmin={isAdmin}
          visibleCount={visibleCount}
          onUpdate={edit}
          onDeleteClick={handleDelete}
        />

        {/* Flecha Derecha */}
        <IconButton
          onClick={next}
          disabled={idx + visibleCount >= sorted.length || sorted.length === 0}
          sx={{
            position: 'absolute',
            top: '50%',
            right: 0,
            transform: {
              xs: 'translateY(-50%)',
              sm: 'translate(100%, -50%)',
            },
            zIndex: 2,
            bgcolor: 'background.paper',
            boxShadow: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* MODAL CREAR */}
      <Modal open={createOpen} title="Crear Noticia" onClose={closeCreate}>
        <NoticeForm ref={formRef} onValidityChange={setCanCreate} />
        <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
          <LoadingButton
            variant="contained"
            onClick={handleCreate}
            disabled={!canCreate}
            loading={loading}
          >
            Crear
          </LoadingButton>
        </Box>
      </Modal>

      {DialogUI}
    </Box>
  );
}