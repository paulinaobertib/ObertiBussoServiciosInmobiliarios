import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    Pagination,
    TextField,
} from "@mui/material";
import { SearchBar } from "../../../shared/components/SearchBar";
import NoticesList from "./NoticesList";
import { useNotices } from "../../hooks/useNotices";
import { useAuthContext } from "../../../user/context/AuthContext";
import { Modal } from "../../../shared/components/Modal";
import { useConfirmDialog } from "../../../shared/components/ConfirmDialog";
import type { Notice } from "../../types/notice";
import theme from "../../../../theme";

export default function NoticesSection() {
    const { notices, loading, error, add, edit, remove, fetchAll, search } =
        useNotices();
    const { isAdmin, info } = useAuthContext();

    // listado paginado
    const [displayed, setDisplayed] = useState<Notice[]>([]);
    const [page, setPage] = useState(1);
    const perPage = 3;

    useEffect(() => {
        const sorted = [...notices].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setDisplayed(sorted);
        setPage(1);
    }, [notices]);

    const pageCount = Math.ceil(displayed.length / perPage);
    const slice = displayed.slice((page - 1) * perPage, page * perPage);

    // modales
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [current, setCurrent] = useState<Partial<Notice>>({});
    const { ask, DialogUI } = useConfirmDialog();

    const openAdd = () => {
        setModalMode("add");
        setCurrent({});
        setModalOpen(true);
    };
    const openEdit = (n: Notice) => {
        setModalMode("edit");
        setCurrent(n);
        setModalOpen(true);
    };
    const closeModal = () => setModalOpen(false);

    const handleSave = async () => {
        if (modalMode === "add") {
            await add({
                userId: info!.id,
                title: current.title!,
                description: current.description!,
                date: new Date().toISOString(),
            });
        } else {
            await edit({
                id: current.id!,
                userId: current.userId!,
                date: current.date!,
                title: current.title!,
                description: current.description!,
            });
        }
        closeModal();
    };

    const handleDelete = (id: number) =>
        ask("¿Eliminar esta novedad?", () => remove(id));

    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            {/* HERO */}
            <Box
                component="header"
                sx={{
                    background: theme.palette.quaternary.main,
                    color: "common.black",
                    textAlign: "center",
                    py: { xs: 4, md: 6 },
                }}
            >
                <Typography variant="h2" component="h1" sx={{ fontWeight: 700 }}>
                    Sección de&nbsp;
                    <Typography
                        component="span"
                        color="primary.main"
                        variant="h2"
                        sx={{ fontWeight: 700 }}
                    >
                        Novedades
                    </Typography>
                </Typography>
            </Box>

            {/* SEARCH & ADD */}
            <Box
                sx={{
                    mt: 4,
                    mb: 4,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                }}
            >
                <Box sx={{ flex: 1, maxWidth: 480 }}>
                    <SearchBar
                        fetchAll={fetchAll}
                        fetchByText={search}
                        onSearch={(res) => {
                            const sorted = res.sort(
                                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                            );
                            setDisplayed(sorted);
                            setPage(1);
                        }}
                        placeholder="Buscar novedades..."
                    />
                </Box>
                {isAdmin && (
                    <Button variant="contained" onClick={openAdd} sx={{ whiteSpace: "nowrap" }}>
                        Nueva novedad
                    </Button>
                )}
            </Box>

            {/* LIST */}
            <Box flexGrow={1} px={2} overflow="auto">
                {loading && <Typography align="center">Cargando…</Typography>}
                {error && <Typography align="center" color="error">{error}</Typography>}
                {!loading && !error && (
                    <NoticesList
                        notices={slice}
                        isAdmin={isAdmin}
                        onEditClick={openEdit}
                        onDeleteClick={handleDelete}
                    />
                )}
            </Box>

            {/* PAGINACIÓN */}
            <Box
                component="footer"
                sx={{
                    py: 3,
                    display: "flex",
                    justifyContent: "center",
                    borderTop: 1,
                    borderColor: "divider",
                }}
            >
                <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(_, v) => setPage(v)}
                    color="primary"
                />
            </Box>

            {/* MODAL */}
            <Modal
                open={modalOpen}
                title={modalMode === "add" ? "Crear novedad" : "Editar novedad"}
                onClose={closeModal}
            >
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        label="Título"
                        fullWidth
                        value={current.title}
                        onChange={e =>
                            setCurrent(c => ({ ...c, title: e.target.value }))
                        }
                    />
                    <TextField
                        label="Descripción"
                        fullWidth
                        multiline
                        rows={4}
                        value={current.description}
                        onChange={e =>
                            setCurrent(c => ({ ...c, description: e.target.value }))
                        }
                    />
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                        <Button onClick={closeModal}>Cancelar</Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={
                                !current.title || !current.description
                            }
                        >
                            {modalMode === "add" ? "Crear" : "Guardar"}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {DialogUI}
        </Box>
    );
}
