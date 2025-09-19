import { useState, useEffect, useMemo, useRef } from "react";
import { Box, Button, IconButton, useMediaQuery, useTheme, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { SearchBar } from "../../../shared/components/SearchBar";
import { useNotices } from "../../hooks/useNotices";
import { useAuthContext } from "../../../user/context/AuthContext";
import { Modal } from "../../../shared/components/Modal";
import { useConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { NoticeForm, NoticeFormHandle } from "./NoticeForm";
import { NoticesList } from "./NoticesList";
import { LoadingButton } from "@mui/lab";

export default function NoticesSection() {
  /* ───────────── datos del hook ───────────── */
  const { notices, add, edit, remove, fetchAll, search, loading } = useNotices();
  const { isAdmin, info } = useAuthContext();

  /* ───────────── lógica de slider ───────────── */
  const sorted = useMemo(
    () => [...notices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [notices]
  );

  const muiTheme = useTheme();
  const xs = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const sm = useMediaQuery(muiTheme.breakpoints.between("sm", "md"));
  const md = useMediaQuery(muiTheme.breakpoints.between("md", "lg"));
  const lg = useMediaQuery(muiTheme.breakpoints.between("lg", "xl"));
  const visibleCount = xs ? 1 : sm ? 2 :  3;

  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [sorted, visibleCount]);
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(sorted.length - visibleCount, i + 1));
  const visibleNotices = useMemo(() => sorted.slice(idx, idx + visibleCount), [sorted, idx, visibleCount]);
  const canScroll = sorted.length > visibleCount;

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

  const handleDelete = (id: number) => ask("¿Eliminar esta novedad?", () => remove(id));

  /* ───────────── render ───────────── */
  const hasNotices = sorted.length > 0;

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {/* BUSCADOR + CREAR */}
      <Box
        sx={{
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, maxWidth: 480 }}>
          <SearchBar fetchAll={fetchAll} fetchByText={search} onSearch={() => {}} placeholder="Buscar novedades…" />
        </Box>
        {isAdmin && (
          <Button variant="contained" onClick={openCreate} sx={{ whiteSpace: "nowrap" }}>
            Nueva noticia
          </Button>
        )}
      </Box>

      {/* SLIDER */}
      <Box
        sx={{
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {hasNotices ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              gap: { xs: 1.5, md: 2.5 },
            }}
          >
            <IconButton
              onClick={prev}
              disabled={!canScroll || idx === 0}
              sx={{
                flexShrink: 0,
                bgcolor: "background.paper",
                boxShadow: 2,
                border: "1px solid",
                borderColor: "divider",
                transition: "transform .2s ease",
                "&:hover": { transform: "translateX(-4px)" },
                "&:disabled": {
                  opacity: 0.4,
                  boxShadow: 0,
                  transform: "none",
                },
              }}
              aria-label="Noticia anterior"
            >
              <ChevronLeftIcon />
            </IconButton>

            <Box sx={{ flex: 1, maxWidth: "100%", overflow: "visible" }}>
              <NoticesList
                notices={visibleNotices}
                isAdmin={isAdmin}
                visibleCount={visibleCount}
                onUpdate={edit}
                onDeleteClick={handleDelete}
              />
            </Box>

            <IconButton
              onClick={next}
              disabled={!canScroll || idx + visibleCount >= sorted.length}
              sx={{
                flexShrink: 0,
                bgcolor: "background.paper",
                boxShadow: 2,
                border: "1px solid",
                borderColor: "divider",
                transition: "transform .2s ease",
                "&:hover": { transform: "translateX(4px)" },
                "&:disabled": {
                  opacity: 0.4,
                  boxShadow: 0,
                  transform: "none",
                },
              }}
              aria-label="Siguiente noticia"
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        ) : (
          <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#000" }}>
            No hay novedades disponibles.
          </Typography>
        )}
      </Box>

      {/* MODAL CREAR */}
      <Modal open={createOpen} title="Crear Noticia" onClose={closeCreate}>
        <NoticeForm ref={formRef} onValidityChange={setCanCreate} />
        <Box display="flex" justifyContent="flex-end" gap={1} mt={3}>
          <LoadingButton variant="contained" onClick={handleCreate} disabled={!canCreate} loading={loading}>
            Crear
          </LoadingButton>
        </Box>
      </Modal>

      {DialogUI}
    </Box>
  );
}
