import React, { useMemo, useState } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import { getRoles } from "../../../services/user.service";
import { useUsers } from "../../../hooks/useUsers";
import { UserForm } from "./UserForm";
import { RoleForm } from "./RoleForm";
import { Modal } from "../../../../shared/components/Modal";
import { GridSection } from "../../../../shared/components/GridSection";
import type { User, Role } from "../../../types/user";
import type { GridRowId } from "@mui/x-data-grid";

const ROLE_TRANSLATE: Record<Role, string> = {
  admin: "Administrador",
  user: "Usuario",
  tenant: "Inquilino",
};

const translateRoles = (raw: unknown): string => {
  if (!Array.isArray(raw) || raw.length === 0) return "—";
  const names = raw.map((r: any) => (typeof r === "string" ? r : r?.name ?? ""));
  return names.filter(Boolean).map((n) => ROLE_TRANSLATE[n as Role]).join(", ");
};

export function UsersSection({
  toggleSelect,
  isSelected,
  showActions = true,
  selectable = true,
  selectedIds, // string[]
}: {
  toggleSelect?: (id: string | null) => void;
  isSelected?: (id: string) => boolean;
  showActions?: boolean;
  selectable?: boolean;
  selectedIds?: string[]; // mantener seleccionado
}) {
  const { users, loading, load, fetchAll, fetchByText } = useUsers();

  // Aseguramos que cada fila tenga id:string para matchear con selectedIds:string[]
  const rows = useMemo(
    () =>
      (users ?? []).map((u: any) => ({
        ...u,
        id: String(u?.id ?? u?.userId),
      })),
    [users]
  );

  // Adaptador: GridRowId | GridRowId[] | null  → string | null
  const gridToggleSelect = (selected: GridRowId | GridRowId[] | null) => {
    const last = Array.isArray(selected)
      ? selected.length
        ? selected[selected.length - 1]
        : null
      : selected;
    toggleSelect?.(last == null ? null : String(last));
  };

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

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

  const openRoles = async (u: User) => {
    setModalTitle("Gestionar roles");
    setModalContent(
      <Box textAlign="center" p={2}>
        <CircularProgress />
      </Box>
    );
    setModalOpen(true);
    try {
      const { data: roles } = await getRoles((u as any).id);
      setModalContent(
        <RoleForm
          userId={(u as any).id}
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
          userId={(u as any).id}
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

  const columns = [
    { field: "firstName", headerName: "Nombre", flex: 1 },
    { field: "lastName", headerName: "Apellido", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
    {
      field: "roles",
      headerName: "Roles",
      flex: 1,
      renderCell: (params: any) => translateRoles(params.row.roles),
      sortable: false,
      filterable: false,
    },
    ...(showActions
      ? [
          {
            field: "actions",
            headerName: "Acciones",
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params: any) => (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
                width="100%"
                height="100%"
              >
                <IconButton size="small" title="Editar" onClick={() => openEdit(params.row)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" title="Eliminar" onClick={() => openDelete(params.row)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" title="Roles" onClick={() => openRoles(params.row)}>
                  <PeopleIcon fontSize="small" />
                </IconButton>
              </Box>
            ),
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <>
      <GridSection
        data={rows} 
        loading={loading}
        columns={columns}
        onSearch={() => {}}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={openDelete}
        onRoles={openRoles}
        toggleSelect={gridToggleSelect}
        isSelected={(id) => isSelected?.(String(id)) ?? false}
        entityName="Usuario"
        showActions={showActions}
        fetchAll={fetchAll}
        fetchByText={fetchByText}
        multiSelect={false}
        selectable={selectable}
        selectedIds={selectedIds} 
      />
      <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </>
  );
}
