// src/app/user/components/users/UsersPanel.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";

import { Modal } from "../../../shared/components/Modal";
import { SearchBar } from "../../../shared/components/SearchBar";
import {
  getAllUsers,
  getTenants,
  searchUsersByText,
  getRoles,
} from "../../services/user.service";
import type { User, Role } from "../../types/user";

import { UserForm } from "./UserForm";
import { RoleForm } from "./RoleForm";

type Filter = "TODOS" | "ADMIN" | "USER" | "TENANT";
const FILTERS: { label: string; value: Filter }[] = [
  { label: "Todos", value: "TODOS" },
  { label: "Admins", value: "ADMIN" },
  { label: "Usuarios", value: "USER" },
  { label: "Tenants", value: "TENANT" },
];

// definir columnas
const userFields = [
  { label: 'Nombre Completo', key: 'title' },
  { label: 'Email', key: 'operation' },
  { label: 'Telefono', key: 'phone' },
  { label: 'Roles', key: 'price' },
];

const columns = userFields;
const gridTemplate = `${columns.map(() => "1fr").join(" ")} 75px`;

export const UsersPanel = () => {
  const theme = useTheme();

  // estado de datos
  const [users, setUsers] = useState<(User & { roles: Role[] })[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("TODOS");

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  // mobile filter menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // selección de fila
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Helpers para SearchBar
  const enrichWithRoles = async (list: User[]) =>
    Promise.all(
      list.map(async (u) => {
        try {
          const res = await getRoles(u.id);
          return { ...u, roles: res.data };
        } catch {
          return { ...u, roles: [] };
        }
      })
    );

  const fetchAllWithRoles = async () => {
    const all = (await getAllUsers()).data;
    return enrichWithRoles(all);
  };

  const fetchByTextWithRoles = async (term: string) => {
    const found = (await searchUsersByText(term)).data;
    return enrichWithRoles(found);
  };

  // recarga inicial / cuando cambia filtro
  const loadByFilter = async () => {
    setLoading(true);
    try {
      let base: User[];
      if (filter === "TENANT") {
        base = (await getTenants()).data;
      } else if (filter === "TODOS") {
        base = (await getAllUsers()).data;
      } else {
        // admin o user
        base = (await getAllUsers()).data;
      }

      let enriched = await enrichWithRoles(base);
      if (filter === "ADMIN") {
        enriched = enriched.filter((u) => u.roles.includes("admin"));
      } else if (filter === "USER") {
        enriched = enriched.filter((u) => u.roles.includes("user"));
      }
      setUsers(enriched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadByFilter();
  }, [filter]);

  // Modales
  const openCreate = () => {
    setModalTitle("Crear usuario");
    setModalContent(
      <UserForm
        action="add"
        onSuccess={() => {
          loadByFilter();
          setModalOpen(false);
        }}
      />
    );
    setModalOpen(true);
  };
  const openEdit = (u: User) => {
    setModalTitle("Editar usuario");
    setModalContent(
      <UserForm
        action="edit"
        item={u}
        onSuccess={() => {
          loadByFilter();
          setModalOpen(false);
        }}
      />
    );
    setModalOpen(true);
  };
  const openDelete = (u: User) => {
    setModalTitle("Eliminar usuario");
    setModalContent(
      <UserForm
        action="delete"
        item={u}
        onSuccess={() => {
          loadByFilter();
          setModalOpen(false);
        }}
      />
    );
    setModalOpen(true);
  };
  const openRoles = async (u: User) => {
    setModalTitle("Gestionar roles");
    setModalContent(
      <Box sx={{ textAlign: "center", p: 2 }}>
        <CircularProgress />
      </Box>
    );
    setModalOpen(true);

    try {
      const res = await getRoles(u.id);
      setModalContent(
        <RoleForm
          userId={u.id}
          currentRoles={res.data}
          onSuccess={() => {
            loadByFilter();
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
            loadByFilter();
            setModalOpen(false);
          }}
          onClose={() => setModalOpen(false)}
        />
      );
    }
  };

  return (
    <>
      {/* ─── Top bar: filtros desktop / menu móvil + SearchBar + “+” ─── */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Desktop: Toggle buttons */}
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

        {/* Móvil: menu de filtros */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <Button onClick={handleMenuOpen}>Filtros</Button>
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

        {/* SearchBar y “+” */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: { xs: "12rem", sm: "20rem" } }}>
            <SearchBar
              fetchAll={fetchAllWithRoles}
              fetchByText={fetchByTextWithRoles}
              onSearch={(res) => setUsers(res)}
              placeholder="Buscar usuario"
            />
          </Box>
          <IconButton onClick={openCreate}>
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ─── Cabeceras (desktop) ─── */}
      <Box
        sx={{
          display: { xs: "none", sm: "grid" },
          gridTemplateColumns: gridTemplate,
          px: 2,
          py: 1,
        }}
      >
        {columns.map((col) => (
          <Typography key={col.key} fontWeight={700}>
            {col.label}
          </Typography>
        ))}
        <Typography fontWeight={700}>Acciones</Typography>
      </Box>

      {/* ─── Filas ─── */}
      <Box sx={{ px: 2, flexGrow: 1, overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : users.length ? (
          users.map((u) => {
            const isSel = selectedId === u.id;
            return (
              <Box
                key={u.id}
                onClick={() => setSelectedId(u.id)}
                sx={{
                  display: { xs: "block", sm: "grid" },
                  gridTemplateColumns: gridTemplate,
                  alignItems: "center",
                  py: 1,
                  mb: 0.5,
                  bgcolor: isSel ? theme.palette.action.selected : "transparent",
                  cursor: "pointer",
                  "&:hover": { bgcolor: theme.palette.action.hover },
                }}
              >
                {/* VS: móvil stacked */}
                <Box sx={{ display: { xs: "block", sm: "none" } }}>
                  <Typography fontWeight={600}>
                    {u.firstName} {u.lastName} - {u.roles.join(", ") || "—"}
                  </Typography>
                  <Typography color="text.secondary">{u.email}</Typography>
                  <Typography color="text.secondary">{u.phone}</Typography>
                </Box>

                {/* desktop columns */}
                <Typography sx={{ display: { xs: "none", sm: "block" } }}>
                  {u.firstName} {u.lastName}
                </Typography>
                <Typography sx={{ display: { xs: "none", sm: "block" } }}>
                  {u.email}
                </Typography>
                <Typography sx={{ display: { xs: "none", sm: "block" } }}>
                  {u.phone}
                </Typography>
                <Typography sx={{ display: { xs: "none", sm: "block" } }}>
                  {u.roles.join(", ") || "—"}
                </Typography>

                {/* acciones */}
                <Box
                  onClick={(e) => e.stopPropagation()}
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <IconButton size="small" onClick={() => openEdit(u)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openDelete(u)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openRoles(u)}>
                    <PeopleIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            );
          })
        ) : (
          <Typography sx={{ mt: 2 }}>No hay usuarios disponibles.</Typography>
        )}
      </Box>

      {/* modal */}
      <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </>
  );
};
