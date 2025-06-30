import { useState, useEffect, ChangeEvent } from 'react';
import { BasePage } from './BasePage';
import { Box, Avatar, Typography, TextField, Grid, useTheme, Stack, Button, IconButton } from '@mui/material';
import { useAuthContext } from '../app/user/context/AuthContext';
import { putUser } from '../app/user/services/user.service';
import { useGlobalAlert } from '../app/shared/context/AlertContext';
import { User } from '../app/user/types/user';
import SettingsIcon from '@mui/icons-material/Settings';
import { FavoritesPanel } from '../app/user/components/FavoritesPanel'
import { PanelManager } from '../app/shared/components/PanelManager';
import { InquiriesPanel } from '../app/property/components/inquiries/InquiriesPanel';
import { AppointmentUser } from '../app/user/components/appointments/AppointmentUser';

export default function UserProfilePage() {
    const theme = useTheme();
    const { info, setInfo } = useAuthContext();
    const { showAlert } = useGlobalAlert();

    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<User>({
        id: '', userName: '', email: '', firstName: '', lastName: '', phone: ''
    });

    const panels = [
        {
            key: 'favorites',
            label: 'MIS FAVORITOS',
            content: <FavoritesPanel />,
        },
        {
            key: 'inquiries',
            label: 'MIS CONSULTAS',
            content: <InquiriesPanel />,
        },
        {
            key: 'appointment',
            label: 'Mis Turnos',
            content: <AppointmentUser />,
        }
    ];

    /* ─────────────────────────  Sincronizar con contexto ───────────────────────── */
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

    const handleChange =
        (field: keyof User) =>
            (e: ChangeEvent<HTMLInputElement>) =>
                setForm(prev => ({ ...prev, [field]: e.target.value }));

    /* ─────────────────────────  Guardar / alternar edición  ────────────────────── */
    const handleEditToggle = async () => {
        if (!editMode) { setEditMode(true); return; }

        setSaving(true);
        try {
            const updated = await putUser(form);
            setInfo(prev => prev
                ? { ...updated, roles: prev.roles }
                : { ...updated, roles: [] });

            showAlert('Perfil actualizado con éxito', 'success');
            setEditMode(false);
        } catch (err: any) {
            showAlert(err.response?.data ?? 'Error desconocido', 'error');
        } finally {
            setSaving(false);
        }
    };

    /* ───────────────────────────────  UI  ───────────────────────────────────────── */
    return (
        <BasePage maxWidth={true}>
            <Box sx={{
                height: { xs: 'auto', sm: '100%' },
                display: 'flex',
                flexDirection: 'column',
                overflow: { xs: 'visible', sm: 'hidden' },
            }}>
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
                        sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}
                    >
                        <Avatar
                            sx={{
                                width: 80, height: 80, fontSize: '2rem',
                                bgcolor: theme.palette.primary.main,
                            }}
                        >
                            {`${form.firstName[0] ?? ''}${form.lastName[0] ?? ''}`.toUpperCase()}
                        </Avatar>

                        <IconButton
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 1000,
                            }}
                        >
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
                            color='secondary'
                            onClick={handleEditToggle}
                            disabled={saving}
                        >
                            {editMode ? 'Guardar cambios' : 'Editar perfil'}
                        </Button>
                    </Stack>

                    {/* ---- DERECHA (formulario) ---- */}
                    <Grid container spacing={2} flexGrow={1}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Username"
                                value={form.userName}
                                fullWidth disabled size="small"
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

                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        overflow: { xs: 'hidden', sm: 'auto' },
                        mt: 2,
                    }}
                >
                    {/* Contenedor dinámico */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        <PanelManager panels={panels} direction="row" />
                    </Box>
                </Box>
            </Box>
        </BasePage>
    );
}