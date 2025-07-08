import React, { useState, useEffect } from "react";
import {
    Box, Typography, IconButton, CircularProgress, useTheme, ToggleButton,
    ToggleButtonGroup, Menu, MenuItem, Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { Modal } from "../../../../shared/components/Modal";
import { SearchBar } from "../../../../shared/components/SearchBar";
import { UserForm } from "./UserForm";
import { RoleForm } from "./RoleForm";
import { UsersList } from "./UsersList";
import { useUsers, Filter } from "../../../hooks/useUsers";
import type { User } from "../../../types/user";
import { getRoles } from "../../../services/user.service";

const FILTERS: { label: string; value: Filter }[] = [
    { label: "Todos", value: "TODOS" },
    { label: "Administradores", value: "ADMIN" },
    { label: "Usuarios", value: "USER" },
    { label: "Inquilinos", value: "TENANT" },
];

export function UsersSection() {
    const theme = useTheme();
    const { users, loading, filter, setFilter, load, fetchAll, fetchByText } = useUsers();

    // **estado local para lo que muestro en pantalla**
    const [displayed, setDisplayed] = useState<typeof users>([]);

    // sincronizar hook.users → displayed
    useEffect(() => {
        setDisplayed(users);
    }, [users]);

    // filtros móviles
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) =>
        setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    // modales
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // — Crear
    const openCreate = () => {
        setModalTitle("Crear usuario");
        setModalContent(
            <UserForm
                action="add"
                onSuccess={() => {
                    load();
                    setModalOpen(false);
                }}
                onClose={() => setModalOpen(false)}
            />
        );
        setModalOpen(true);
    };

    // — Editar
    const openEdit = (u: User) => {
        setModalTitle("Editar usuario");
        setModalContent(
            <UserForm
                action="edit"
                item={u}
                onSuccess={() => {
                    load();
                    setModalOpen(false);
                }}
                onClose={() => setModalOpen(false)}
            />
        );
        setModalOpen(true);
    };

    // — Eliminar
    const openDelete = (u: User) => {
        setModalTitle("Eliminar usuario");
        setModalContent(
            <UserForm
                action="delete"
                item={u}
                onSuccess={() => {
                    load();
                    setModalOpen(false);
                }}
                onClose={() => setModalOpen(false)}
            />
        );
        setModalOpen(true);
    };

    // — Roles
    const openRoles = async (u: User) => {
        setModalTitle("Gestionar roles");
        setModalContent(
            <Box textAlign="center" p={2}>
                <CircularProgress />
            </Box>
        );
        setModalOpen(true);

        try {
            const { data: roles } = await getRoles(u.id);
            setModalContent(
                <RoleForm
                    userId={u.id}
                    currentRoles={roles}
                    onSuccess={() => {
                        load();
                        setModalOpen(false);
                    }}
                    onClose={() => setModalOpen(false)}
                />
            );
        } catch {
            setModalContent(
                <RoleForm
                    userId={u.id}
                    currentRoles={[]}
                    onSuccess={() => {
                        load();
                        setModalOpen(false);
                    }}
                    onClose={() => setModalOpen(false)}
                />
            );
        }
    };

    return (
        <>
            {/* ─── Toolbar ─── */}
            <Box
                sx={{
                    px: 2,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                {/* desktop filters */}
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <ToggleButtonGroup
                        value={filter}
                        exclusive
                        size="small"
                        onChange={(_, v) => v && setFilter(v)}
                    >
                        {FILTERS.map((f) => (
                            <ToggleButton key={f.value} value={f.value}>
                                {f.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                {/* mobile filters */}
                <Box sx={{ display: { xs: "flex", sm: "none" } }}>
                    <Button variant="outlined" size="small" onClick={handleMenuOpen}>
                        Filtros
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    >
                        {FILTERS.map((f) => (
                            <MenuItem
                                key={f.value}
                                selected={filter === f.value}
                                onClick={() => {
                                    setFilter(f.value);
                                    handleMenuClose();
                                }}
                            >
                                {f.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>

                {/* search + add */}
                <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ flexGrow: 1, minWidth: { xs: 0, sm: "20rem" } }}>
                        <SearchBar
                            fetchAll={fetchAll}
                            fetchByText={fetchByText}
                            onSearch={(results) => setDisplayed(results)}
                            placeholder="Buscar usuario…"
                        />
                    </Box>
                    <IconButton onClick={openCreate}>
                        <AddIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* ─── Column headers (sm+) ─── */}
            <Box
                sx={{
                    display: { xs: "none", sm: "grid" },
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 75px",
                    px: 2,
                    py: 1,
                    bgcolor: theme.palette.background.paper,
                }}
            >
                <Typography fontWeight={700}>Nombre completo</Typography>
                <Typography fontWeight={700}>Email</Typography>
                <Typography fontWeight={700}>Teléfono</Typography>
                <Typography fontWeight={700}>Roles</Typography>
                <Typography fontWeight={700}>Acciones</Typography>
            </Box>

            {/* ─── Listado ─── */}
            <Box sx={{ px: 2, flexGrow: 1, overflowY: "auto" }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress size={28} />
                    </Box>
                ) : (
                    <UsersList
                        users={displayed}
                        onEdit={openEdit}
                        onDelete={openDelete}
                        onRoles={openRoles}
                    />
                )}
            </Box>

            {/* ─── Modal ─── */}
            <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
                {modalContent}
            </Modal>
        </>
    );
}
