import { useState, useEffect, ChangeEvent } from 'react';
import { BasePage } from './BasePage';
import {
    Box, Avatar, Typography, TextField,
    Grid, useTheme, Stack,
    Button,
    IconButton,
} from '@mui/material';
import { useAuthContext } from '../app/user/context/AuthContext';
import { putUser } from '../app/user/services/user.service';
import { useGlobalAlert } from '../app/property/context/AlertContext';
import { User } from '../app/user/types/user';
import SettingsIcon from '@mui/icons-material/Settings';
import { useFavorites } from '../app/user/hooks/useFavorites';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';
import PropertyCard from '../app/property/components/PropertyCard';
import { useNavigate } from 'react-router-dom';

export default function UserProfilePage() {
    const theme = useTheme();
    const { info, setInfo } = useAuthContext();
    const { showAlert } = useGlobalAlert();
    const { favorites } = useFavorites();
    const { propertiesList } = usePropertyCrud();
    const navigate = useNavigate();

    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<User>({
        id: '', userName: '', email: '', firstName: '', lastName: '', phone: ''
    });

    const [section, setSection] = useState<'favorites' | 'appointment' | 'comments'>();

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

    const favoriteProperties = propertiesList.filter(prop =>
        favorites.some(fav => fav.propertyId === prop.id)
    );

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

                {/* Selector separado */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexShrink: 0 }}>
                    <Button
                        variant={section === 'favorites' ? 'contained' : 'outlined'}
                        onClick={() => setSection('favorites')}
                    >
                        Mis Favoritos
                    </Button>
                    <Button
                        variant={section === 'appointment' ? 'contained' : 'outlined'}
                        onClick={() => setSection('appointment')}
                    >
                        Mis Turnos
                    </Button>
                    <Button
                        variant={section === 'comments' ? 'contained' : 'outlined'}
                        onClick={() => setSection('comments')}
                    >
                        Mis Consultas
                    </Button>
                </Box>

                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        overflow: { xs: 'hidden', sm: 'auto' },
                        mb: 2,
                        bgcolor: 'background.paper',
                        boxShadow: 4,
                        borderRadius: 2,
                    }}
                >

                    {/* Contenedor dinámico */}
                    {section && (
                        <Box
                            sx={{
                                flexGrow: 1,
                                minHeight: 0,
                                overflowY: { xs: 'visible', md: 'auto' },
                                p: 2,
                                mt: 1,
                                display: 'grid',
                                gridTemplateRows: 'auto 1fr',
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                {section === 'favorites'}
                                {section === 'appointment'}
                                {section === 'comments'}
                            </Typography>

                            {section === 'favorites' && (
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(120px, 15vw, 150px), 1fr))', // Dynamic min width
                                        gap: 2,
                                        height: '100%',
                                        alignContent: 'start',
                                        mb: 2,
                                    }}
                                >
                                    {favoriteProperties.length === 0 ? (
                                        <Typography
                                            sx={{
                                                textAlign: 'center',
                                                color: 'text.secondary',
                                                width: '100%',
                                                gridColumn: '1 / -1',
                                            }}
                                        >
                                            No tienes favoritos aún.
                                        </Typography>
                                    ) : (
                                        favoriteProperties.map(prop => (
                                            <Box
                                                key={prop.id}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                }}
                                            >
                                                <PropertyCard
                                                    key={prop.id}
                                                    property={prop}
                                                    onClick={() => navigate(`/properties/${prop.id}`)}
                                                />
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            )}
                            {section === 'appointment' && (
                                <Box>
                                    Aquí iría tu componente de turnos…
                                </Box>
                            )}
                            {section === 'comments' && (
                                <Box>
                                    Aquí irían tus comentarios…
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </BasePage>
    );
}