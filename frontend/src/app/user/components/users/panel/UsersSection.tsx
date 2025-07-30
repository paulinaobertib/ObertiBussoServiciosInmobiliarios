import React, { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, CircularProgress, Button } from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRowSelectionModel,
    GridRenderCellParams,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';

import { Modal } from '../../../../shared/components/Modal';
import { SearchBar } from '../../../../shared/components/SearchBar';
import { UserForm } from './UserForm';
import { RoleForm } from './RoleForm';
import { useUsers } from '../../../hooks/useUsers';
import { getRoles } from '../../../services/user.service';
import type { User } from '../../../types/user';

interface Props {
    toggleSelect?: (id: string) => void;
    isSelected?: (id: string) => boolean;
    showActions?: boolean;
}

export function UsersSection({
    toggleSelect: externalToggle,
    isSelected: externalIsSel,
    showActions = true,
}: Props) {
    const {
        users,
        loading,
        load,
        fetchAll,
        fetchByText,
        toggleSelect: internalToggle,
        isSelected: internalIsSel,
    } = useUsers();

    const selectFn = externalToggle ?? internalToggle;
    const isSelFn = externalIsSel ?? internalIsSel;

    const [displayed, setDisplayed] = useState<User[]>([]);
    useEffect(() => setDisplayed(users), [users]);

    const [selection, setSelection] = useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set(),
    });

    useEffect(() => {
        const selectedIds = displayed.filter((u) => isSelFn(u.id)).map((u) => u.id);
        setSelection({ type: 'include', ids: new Set(selectedIds) });
    }, [displayed, isSelFn]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    const handleModal = (title: string, content: React.ReactNode) => {
        setModalTitle(title);
        setModalContent(content);
        setModalOpen(true);
    };

    const openCreate = () =>
        handleModal(
            'Crear usuario',
            <UserForm
                action="add"
                onSuccess={() => {
                    load();
                    setModalOpen(false);
                }}
                onClose={() => setModalOpen(false)}
            />
        );

    const openEdit = (user: User) =>
        handleModal(
            'Editar usuario',
            <UserForm
                action="edit"
                item={user}
                onSuccess={() => {
                    load();
                    setModalOpen(false);
                }}
                onClose={() => setModalOpen(false)}
            />
        );

    const openDelete = (user: User) =>
        handleModal(
            'Eliminar usuario',
            <UserForm
                action="delete"
                item={user}
                onSuccess={() => {
                    load();
                    setModalOpen(false);
                }}
                onClose={() => setModalOpen(false)}
            />
        );

    const openRoles = async (user: User) => {
        handleModal('Gestionar roles', <Box textAlign="center" p={2}><CircularProgress /></Box>);
        try {
            const { data: roles } = await getRoles(user.id);
            handleModal(
                'Gestionar roles',
                <RoleForm
                    userId={user.id}
                    currentRoles={roles}
                    onSuccess={() => {
                        load();
                        setModalOpen(false);
                    }}
                    onClose={() => setModalOpen(false)}
                />
            );
        } catch {
            handleModal(
                'Gestionar roles',
                <RoleForm
                    userId={user.id}
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

    const columns: GridColDef<User>[] = [
        {
            field: 'fullName',
            headerName: 'Nombre completo',
            flex: 1,
            renderCell: (params: GridRenderCellParams<User>) =>
                `${params.row.firstName} ${params.row.lastName}`,
            sortable: false,
            filterable: false,
        },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'phone', headerName: 'Teléfono', flex: 1 },
        {
            field: 'roles',
            headerName: 'Roles',
            flex: 1,
            renderCell: (params: GridRenderCellParams<User>) =>
                Array.isArray(params.row.roles)
                    ? params.row.roles.join(', ')
                    : '—',
            sortable: false,
            filterable: false,
        },
        ...(showActions
            ? [
                {
                    field: 'actions',
                    headerName: 'Acciones',
                    width: 120,
                    sortable: false,
                    filterable: false,
                    renderCell: (params: GridRenderCellParams<User>) => (
                        <Box>
                            <IconButton size="small" onClick={() => openEdit(params.row)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => openDelete(params.row)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => openRoles(params.row)}>
                                <PeopleIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ),
                },
            ]
            : []),
    ];

    const handleRowSelection = useCallback(
        (newModel: GridRowSelectionModel) => {
            const ids = Array.from(newModel.ids);
            setSelection({ type: 'include', ids: new Set(ids) });
            ids.forEach((id) => {
                if (!selection.ids.has(id)) selectFn(id.toString());
            });
            selection.ids.forEach((id) => {
                if (!ids.includes(id)) selectFn(id.toString());
            });
        },
        [selection, selectFn]
    );

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <SearchBar
                    fetchAll={fetchAll}
                    fetchByText={fetchByText}
                    onSearch={(results: User[]) => setDisplayed(results)}
                    placeholder="Buscar usuario…"
                />
                <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreate}>
                    Agregar
                </Button>
            </Box>

            <Box height={500} width="100%">
                <DataGrid<User>
                    rows={displayed}
                    columns={columns}
                    loading={loading}
                    checkboxSelection={!!selectFn}
                    rowSelectionModel={selection}
                    onRowSelectionModelChange={handleRowSelection}
                    getRowId={(row: User) => row.id}
                />
            </Box>

            <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
                {modalContent}
            </Modal>
        </>
    );
}
