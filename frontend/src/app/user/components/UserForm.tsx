import { useState, useEffect, ChangeEvent } from 'react';
import { Box, Avatar, Typography, TextField, Grid, Stack, Button, IconButton, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuthContext } from '../../user/context/AuthContext';
import { putUser } from '../../user/services/user.service';
import { useGlobalAlert } from '../../shared/context/AlertContext';
import type { User } from '../../user/types/user';

export const UserForm = () => {
    const theme = useTheme();
    const { info, setInfo } = useAuthContext();
    const { showAlert } = useGlobalAlert();

    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<User>({
        id: '', userName: '', email: '', firstName: '', lastName: '', phone: ''
    });

    useEffect(() => {
        if (!info) return;
        setForm({
            id: info.id,
            userName: info.userName,
            email: info.email,
            firstName: info.firstName,
            lastName: info.lastName,
            phone: info.phone ?? '',
        });
    }, [info]);

    const handleChange = (field: keyof User) => (e: ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleEditToggle = async () => {
        if (!editMode) { setEditMode(true); return; }

        setSaving(true);
        try {
            const updated = await putUser(form);
            setInfo(prev => prev
                ? { ...updated, roles: prev.roles }
                : { ...updated, roles: [] }
            );
            showAlert('Perfil actualizado con éxito', 'success');
            setEditMode(false);
        } catch (err: any) {
            showAlert(err.response?.data ?? 'Error desconocido', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box
            sx={{
                mt: 2,
                p: 2,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                alignItems: { xs: 'stretch', md: 'center' },
                bgcolor: 'background.paper',
                boxShadow: 4,
                borderRadius: 2,
                flexShrink: 0,
            }}
        >
            {/* ---- IZQUIERDA ---- */}
            <Stack
                spacing={1}
                alignItems="center"
                sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0, position: 'relative' }}
            >
                <Avatar
                    sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: theme.palette.primary.main }}
                >
                    {`${form.firstName[0] ?? ''}${form.lastName[0] ?? ''}`.toUpperCase()}
                </Avatar>

                <IconButton sx={{ position: 'absolute', top: -10, left: -10, zIndex: 1 }}>
                    <SettingsIcon fontSize="large" />
                </IconButton>

                <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {form.firstName} {form.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {form.email}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleEditToggle}
                    disabled={saving}
                >
                    {editMode ? 'Guardar cambios' : 'Editar perfil'}
                </Button>
            </Stack>

            {/* ---- DERECHA (formulario) ---- */}
            <Grid container spacing={2} flexGrow={1}>
                <Grid size={12}>
                    <TextField
                        label="Username"
                        value={form.userName}
                        fullWidth
                        disabled
                        size="small"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Nombre"
                        value={form.firstName}
                        onChange={handleChange('firstName')}
                        fullWidth size="small"
                        disabled={!editMode}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Apellido"
                        value={form.lastName}
                        onChange={handleChange('lastName')}
                        fullWidth size="small"
                        disabled={!editMode}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Correo electrónico"
                        value={form.email}
                        onChange={handleChange('email')}
                        fullWidth size="small"
                        disabled={!editMode}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Teléfono"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        fullWidth size="small"
                        disabled={!editMode}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}
