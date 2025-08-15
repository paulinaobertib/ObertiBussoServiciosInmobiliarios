import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Autocomplete, TextField } from '@mui/material';
import type { Role } from '../../../types/user';
import { useGlobalAlert } from '../../../../shared/context/AlertContext';
import { addRoleToUser, deleteRoleFromUser, getRoles } from '../../../services/user.service';

const AVAILABLE_ROLES: { label: string; value: Role }[] = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Usuario', value: 'user' },
    { label: 'Inquilino', value: 'tenant' },
];

export interface RoleFormProps {
    userId: string;
    currentRoles: Role[];
    onSuccess: () => void;
    onClose: () => void;
}

export const RoleForm = ({
    userId,
    currentRoles,
    onSuccess,
    onClose,
}: RoleFormProps) => {
    const { showAlert } = useGlobalAlert();
    const [selected, setSelected] = useState<Role[]>([]);
    const [initial, setInitial] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);

    // Inicializa roles
    useEffect(() => {
        if (currentRoles.length) {
            setSelected(currentRoles);
            setInitial(currentRoles);
        } else {
            setLoading(true);
            getRoles(userId)
                .then(res => {
                    setSelected(res.data);
                    setInitial(res.data);
                })
                .catch(() => {
                    setSelected([]);
                    setInitial([]);
                })
                .finally(() => setLoading(false));
        }
    }, [userId, currentRoles]);

    const handleSave = async () => {
        if (!selected.length) {
            showAlert('Debe asignar al menos un rol', 'warning');
            return;
        }
        setLoading(true);
        try {
            const toAdd = selected.filter(r => !initial.includes(r));
            const toRemove = initial.filter(r => !selected.includes(r));
            await Promise.all([
                ...toAdd.map(r => addRoleToUser(userId, r)),
                ...toRemove.map(r => deleteRoleFromUser(userId, r)),
            ]);
            showAlert('Roles actualizados con éxito', 'success');
            onSuccess();
            onClose();
        } catch (err: any) {
            const backendMessage = err.response?.data?.message || err.response?.data || err.message || 'Error al actualizar roles';
            showAlert(backendMessage, 'error');
            console.error("Error en handleSave:", backendMessage);
        } finally {
            setLoading(false);
        }
    };

    const hasChanges =
        selected.length !== initial.length ||
        !selected.every(r => initial.includes(r));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
                Selecciona roles:
            </Typography>
            <Autocomplete
                multiple
                options={AVAILABLE_ROLES}
                getOptionLabel={o => o.label}
                value={AVAILABLE_ROLES.filter(o => selected.includes(o.value))}
                onChange={(_, vs) => setSelected(vs.map(o => o.value))}
                disableCloseOnSelect
                renderInput={params => (
                    <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        helperText={!selected.length && 'Debe elegir al menos un rol'}
                    />
                )}
            />

            <LoadingButton
                variant="contained"
                onClick={handleSave}
                loading={loading}
                disabled={!hasChanges}
            >
                Guardar roles
            </LoadingButton>
        </Box>
    );
};
