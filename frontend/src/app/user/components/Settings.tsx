import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Drawer,
    IconButton,
    Box,
    Typography,
    Switch,
    Divider,
    List,
    ListItem,
    useTheme,
    useMediaQuery,
    Stack,
    Tooltip,
    Chip,
    Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { useAuthContext } from '../context/AuthContext';
import {
    getUserNotificationPreferencesByUser,
    updateUserNotificationPreference,
    getAllNotifications,
    getNotificationsByUser,
} from '../services/notification.service';
import { NotificationType } from '../../user/types/notification';

type Preference = { id: number; type: NotificationType; enabled: boolean };
type NotificationItem = { id: number; type: NotificationType; date: string };

const TYPE_LABELS: Record<NotificationType, string> = {
    PROPIEDADNUEVA: 'Nueva propiedad disponible',
    PROPIEDADINTERES: 'Actualizaciones de interés',
};

const drawerWidth = 380;

/** Card visual unificado (sin hover) para historial (usuario/admin) */
function HistoryCard({
    title,
    subtitle,
    right,
}: {
    title: string;
    subtitle: string;
    right?: React.ReactNode;
}) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                width: '100%',
                p: 1.25,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                    {title}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {subtitle}
                </Typography>
            </Box>
            {right}
        </Box>
    );
}

/** Preferencia con estilo “card” (sin hover) */
function PrefRow({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, c: boolean) => void;
}) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1],
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Typography variant="body2">{label}</Typography>
            <Switch size="small" checked={checked} onChange={onChange} />
        </Box>
    );
}

export default function SettingsDrawer() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { info, isAdmin } = useAuthContext();
    const userId = info?.id || '';

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [preferences, setPreferences] = useState<Preference[]>([]);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    const fmtDate = useMemo(
        () => new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }),
        []
    );

    // Resumen admin (día + tipo)
    const summary = useMemo(() => {
        const m: Record<string, { date: string; type: NotificationType; count: number }> = {};
        notifications.forEach((n) => {
            const day = new Date(n.date).toLocaleDateString();
            const key = `${day}|${n.type}`;
            if (!m[key]) m[key] = { date: day, type: n.type, count: 0 };
            m[key].count++;
        });
        return Object.values(m).sort((a, b) => {
            const [da, db] = [new Date(a.date), new Date(b.date)];
            return db.getTime() - da.getTime() || a.type.localeCompare(b.type);
        });
    }, [notifications]);

    const refresh = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            if (isAdmin) {
                const resp = await getAllNotifications();
                setNotifications(resp.data || []);
            } else if (userId) {
                const [p, n] = await Promise.all([
                    getUserNotificationPreferencesByUser(userId),
                    getNotificationsByUser(userId),
                ]);
                setPreferences(p.data || []);
                setNotifications(n.data || []);
            } else {
                setPreferences([]);
                setNotifications([]);
            }
        } catch {
            setError('No pudimos cargar los datos.');
            if (!isAdmin) setPreferences([]);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [isAdmin, userId]);

    useEffect(() => {
        if (open) refresh(); // carga al abrir (sin botón de refresh)
    }, [open, refresh]);

    const handleTogglePref =
        (pref: Preference) =>
            async (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
                setPreferences((prev) => prev.map((p) => (p.id === pref.id ? { ...p, enabled: checked } : p)));
                try {
                    await updateUserNotificationPreference(pref.id, checked);
                } catch {
                    setPreferences((prev) => prev.map((p) => (p.id === pref.id ? { ...p, enabled: !checked } : p)));
                }
            };

    const countToday = useMemo(() => {
        const today = new Date().toLocaleDateString();
        return notifications.filter((n) => new Date(n.date).toLocaleDateString() === today).length;
    }, [notifications]);

    return (
        <>
            <Box
                sx={{
                    width: '100%',
                    display: { xs: 'flex', sm: 'none' },
                    justifyContent: 'flex-start',
                }}
            >
                <Button
                    color="inherit"
                    onClick={() => setOpen(true)}
                    sx={{ px: 0, }}
                    aria-label="Abrir notificaciones"
                >
                    <Typography>Notificaciones</Typography>
                </Button>
            </Box>

            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Tooltip title="Notificaciones">
                    <IconButton color="inherit" onClick={() => setOpen(true)} aria-label="Abrir notificaciones">
                        <NotificationsIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: {
                        width: isMobile ? '92%' : drawerWidth,
                        p: 0,
                        bgcolor: 'background.default',
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        zIndex: 100

                    },
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        position: 'sticky',
                        top: 0,
                        bgcolor: 'background.paper',
                        zIndex: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="h6" sx={{ flex: 1, letterSpacing: 0.2 }}>
                        Notificaciones
                    </Typography>
                    <Chip
                        size="small"
                        variant={isAdmin ? 'filled' : 'outlined'}
                        color={isAdmin ? 'secondary' : 'default'}
                        label={isAdmin ? 'Admin' : `${countToday} hoy`}
                    />
                    <IconButton onClick={() => setOpen(false)}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Box>

                {/* Main content: pref (no scroll) + history (con scroll) */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0, // importante para que el hijo con overflow funcione
                    }}
                >
                    {/* Preferencias (solo user) */}
                    {!isAdmin && (
                        <Box sx={{ p: 2, pb: 1, display: 'flex', flexDirection: 'column', gap: 1, flex: '0 0 auto' }}>
                            <Typography variant="subtitle2">Preferencias</Typography>
                            {loading ? (
                                <Typography variant="body2" color="text.secondary">Cargando…</Typography>
                            ) : preferences.length ? (
                                preferences.map((pref) => (
                                    <PrefRow
                                        key={pref.id}
                                        label={TYPE_LABELS[pref.type]}
                                        checked={pref.enabled}
                                        onChange={handleTogglePref(pref)}
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">Sin preferencias configuradas.</Typography>
                            )}
                        </Box>
                    )}

                    {/* Divider entre preferencias e historial */}
                    {!isAdmin && <Divider sx={{ mx: 2 }} />}

                    {/* Historial (scroll SOLO acá) */}
                    <Box
                        sx={{
                            p: 2,
                            pt: 1.5,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            flex: 1,
                            minHeight: 0,
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2">
                                Historial{isAdmin ? ' (resumen)' : ''}
                            </Typography>
                            {isAdmin && (
                                <Typography variant="subtitle2">
                                    Envíos
                                </Typography>
                            )}
                        </Stack>
                        {error && (
                            <Typography variant="body2" color="error">
                                {error}
                            </Typography>
                        )}

                        {loading ? (
                            <Typography variant="body2" color="text.secondary">Cargando…</Typography>
                        ) : (
                            <List
                                sx={{
                                    p: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    overflowY: 'auto',   // ← scroll solo aquí
                                    flex: 1,
                                    minHeight: 0,
                                }}
                            >
                                {isAdmin ? (
                                    summary.length ? (
                                        summary.map(({ date, type, count }) => (
                                            <ListItem key={`${date}|${type}`} sx={{ p: 0 }}>
                                                <HistoryCard
                                                    title={TYPE_LABELS[type]}
                                                    subtitle={date}
                                                    right={<Chip size="small" label={count} />}
                                                />
                                            </ListItem>
                                        ))
                                    ) : (
                                        <ListItem sx={{ p: 0 }}>
                                            <Typography variant="body2" color="text.secondary">Sin actividad.</Typography>
                                        </ListItem>
                                    )
                                ) : notifications.length ? (
                                    notifications.map((n) => (
                                        <ListItem key={n.id} sx={{ p: 0 }}>
                                            <HistoryCard
                                                title={TYPE_LABELS[n.type]}
                                                subtitle={fmtDate.format(new Date(n.date))}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem sx={{ p: 0 }}>
                                        <Typography variant="body2" color="text.secondary">Sin notificaciones.</Typography>
                                    </ListItem>
                                )}
                            </List>
                        )}
                    </Box>
                </Box>
            </Drawer >
        </>
    );
}
