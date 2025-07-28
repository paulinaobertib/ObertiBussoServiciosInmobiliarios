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

export default function NoticesSection() {
  /* ───────────── datos del hook ───────────── */
  const { notices, add, edit, remove, fetchAll, search } = useNotices();
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
      {/* HEADER */}
      {/* <Box
        component="header"
        sx={{
          background: theme.palette.quaternary.main,
          color: 'common.black',
          textAlign: 'center',
          py: { xs: 4, md: 6 },
        }}
      >
        <Typography variant="h2" component="h1" sx={{ fontWeight: 700 }}>
          Sección de{' '}
          <Typography
            component="span"
            color="primary.main"
            variant="h2"
            sx={{ fontWeight: 700 }}
          >
            Novedades
          </Typography>
        </Typography>
      </Box> */}

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
            Nueva novedad
          </Button>
        )}
      </Box>

      {/* SLIDER */}
      <Box sx={{ position: 'relative', width: '100%', py: 2 }}>
        {/* Flecha Izquierda */}
        <IconButton
          onClick={prev}
          disabled={idx === 0 || sorted.length === 0}
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            bgcolor: 'background.paper',
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
          disabled={
            idx + visibleCount >= sorted.length || sorted.length === 0
          }
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            bgcolor: 'background.paper',
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* MODAL CREAR */}
      <Modal open={createOpen} title="Crear novedad" onClose={closeCreate}>
        <NoticeForm ref={formRef} onValidityChange={setCanCreate} />
        <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!canCreate}
          >
            Crear
          </Button>
        </Box>
      </Modal>

      {DialogUI}
    </Box>
  );
}
