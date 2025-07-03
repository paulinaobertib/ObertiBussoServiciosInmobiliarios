// src/app/user/components/forms/RoleForm.tsx
import { useState, useEffect } from "react";
import {
    Box,
    Button,
    TextField,
    Autocomplete,
    Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import type { Role } from "../../types/user";
import {
    addRoleToUser,
    deleteRoleFromUser,
    getRoles,
} from "../../services/user.service";

const AVAILABLE_ROLES = [
    { label: 'Admin', value: 'admin' as Role },
    { label: 'User', value: 'user' as Role },
    { label: 'Tenant', value: 'tenant' as Role },
];

interface RoleFormProps {
    userId: string;
    currentRoles: Role[];
    onSuccess: () => void;
    onClose: () => void;
}

export const RoleForm = ({ userId, currentRoles, onSuccess, onClose }: RoleFormProps) => {
    const { showAlert } = useGlobalAlert();

    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const [initialRoles, setInitialRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentRoles && currentRoles.length) {
            setSelectedRoles(currentRoles);
            setInitialRoles(currentRoles);
        } else {
            setLoading(true);
            getRoles(userId)
                .then(res => {
                    setSelectedRoles(res.data);
                    setInitialRoles(res.data);
                })
                .catch(() => {
                    setSelectedRoles([]);
                    setInitialRoles([]);
                })
                .finally(() => setLoading(false));
        }
    }, [userId, currentRoles]);

    const handleSave = async () => {
        if (selectedRoles.length === 0) {
            showAlert('Debe asignar al menos un rol', 'warning');
            return;
        }
        setLoading(true);
        try {
            const toAdd = selectedRoles.filter(r => !initialRoles.includes(r));
            const toRemove = initialRoles.filter(r => !selectedRoles.includes(r));
            await Promise.all([
                ...toAdd.map(r => addRoleToUser(userId, r)),
                ...toRemove.map(r => deleteRoleFromUser(userId, r)),
            ]);
            showAlert('Roles del usuario actualizados con éxito', 'success');
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            showAlert('Error al actualizar roles', 'error');
        } finally {
            setLoading(false);
        }
    };

    const hasChanges =
        selectedRoles.length !== initialRoles.length ||
        !selectedRoles.every(r => initialRoles.includes(r));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Selecciona los roles de este usuario:
            </Typography>
            <Autocomplete
                multiple
                options={AVAILABLE_ROLES}
                getOptionLabel={opt => opt.label}
                value={selectedRoles.map(r => AVAILABLE_ROLES.find(o => o.value === r)!)}
                onChange={(_, options) =>
                    setSelectedRoles(options.map(o => o.value))
                }
                disableCloseOnSelect
                renderInput={params => (
                    <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        helperText={selectedRoles.length === 0 ? 'Se requiere al menos un rol' : ''}
                        error={selectedRoles.length === 0}
                    />
                )}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <LoadingButton
                    variant="contained"
                    onClick={handleSave}
                    loading={loading}
                    disabled={!hasChanges || selectedRoles.length === 0}
                >
                    Guardar
                </LoadingButton>
            </Box>
        </Box>
    );
};
