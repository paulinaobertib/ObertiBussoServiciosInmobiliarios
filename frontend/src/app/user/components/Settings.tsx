// src/app/shared/components/SettingsDrawer.tsx
import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import { useAuthContext } from '../context/AuthContext';
import {
    getUserNotificationPreferencesByUser,
    updateUserNotificationPreference,
    getAllNotifications
} from '../services/notification.service';
import { getNotificationsByUser } from '../services/notification.service';
import { NotificationType } from '../../user/types/notification';
import NotificationsIcon from '@mui/icons-material/Notifications';

// Etiquetas amigables para el front
const TYPE_LABELS: Record<NotificationType, string> = {
    PROPIEDADNUEVA: 'Nueva propiedad disponible',
    PROPIEDADINTERES: 'Actualizaciones de interés',
};

const drawerWidth = 300;

export default function SettingsDrawer() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { info, isAdmin } = useAuthContext();
    const userId = info?.id || '';

    const [open, setOpen] = useState(false);
    const [preferences, setPreferences] = useState<{
        id: number;
        type: NotificationType;
        enabled: boolean;
    }[]>([]);
    const [notifications, setNotifications] = useState<{
        id: number;
        type: NotificationType;
        date: string;
    }[]>([]);

    // Agrupar notificaciones para admin
    const summary = useMemo(() => {
        const map: Record<string, { date: string; type: NotificationType; count: number }> = {};
        notifications.forEach((n) => {
            const day = new Date(n.date).toLocaleDateString();
            const key = `${day}|${n.type}`;
            if (!map[key]) map[key] = { date: day, type: n.type, count: 0 };
            map[key].count++;
        });
        return Object.values(map);
    }, [notifications]);

    useEffect(() => {
        if (!open) return;
        if (isAdmin) {
            // Admin: cargar todas las notificaciones
            getAllNotifications()
                .then((resp) => setNotifications(resp.data))
                .catch(() => setNotifications([]));
            // No cargar preferencias para admin
        } else if (userId) {
            // Usuario regular: cargar sus preferencias y notificaciones
            getUserNotificationPreferencesByUser(userId)
                .then((resp) => setPreferences(resp.data))
                .catch(() => setPreferences([]));
            getNotificationsByUser(userId)
                .then((resp) => setNotifications(resp.data))
                .catch(() => setNotifications([]));
        }
    }, [open, userId, isAdmin]);

    const handleTogglePref = (
        pref: { id?: number; type: NotificationType; enabled: boolean }
    ) => async (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        if (!pref.id) return;
        await updateUserNotificationPreference(pref.id, checked);
        setPreferences((prev) =>
            prev.map((p) => (p.id === pref.id ? { ...p, enabled: checked } : p))
        );
    };

    return (
        <>
            <IconButton color="inherit" onClick={() => setOpen(true)}>
                <NotificationsIcon />
            </IconButton>
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: {
                        width: isMobile ? '80%' : drawerWidth,
                        p: 2,
                        bgcolor: 'background.paper',
                    },
                }}
            >
                <Typography variant="h6" mb={2}>
                    Notificaciones
                </Typography>
                <Divider />

                {/* Preferencias: solo usuarios no admin */}
                {!isAdmin && (
                    <Box mt={2}>

                        <Stack spacing={1}>
                            {preferences.map((pref) => (
                                <Box
                                    key={pref.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        px: 1,
                                        py: 0.5,
                                    }}
                                >
                                    <Typography variant="body2">
                                        {TYPE_LABELS[pref.type]}
                                    </Typography>
                                    <Switch
                                        size="small"
                                        checked={pref.enabled}
                                        onChange={handleTogglePref(pref)}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Historial */}
                <Box mt={3}>
                    <Typography variant="subtitle2" mb={1}>
                        Historial{isAdmin ? ' resumido de notificaciones' : ''}
                    </Typography>
                    {isAdmin ? (
                        <List sx={{ maxHeight: 200, overflowY: 'auto', p: 0 }}>
                            {summary.map(({ date, type, count }) => (
                                <ListItem key={`${date}|${type}`} sx={{ px: 1, py: 0.5 }}>
                                    <Stack spacing={0.3} direction="row" justifyContent="space-between" width="100%">
                                        <Typography variant="body2">
                                            {date} – {TYPE_LABELS[type]}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {count} envíos
                                        </Typography>
                                    </Stack>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <List sx={{ maxHeight: 200, overflowY: 'auto', p: 0 }}>
                            {notifications.length ? (
                                notifications.map((n) => (
                                    <ListItem key={n.id} sx={{ px: 1, py: 0.5 }}>
                                        <Stack spacing={0.2}>
                                            <Typography variant="body2">
                                                {TYPE_LABELS[n.type]}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(n.date).toLocaleString()}
                                            </Typography>
                                        </Stack>
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                                    Sin notificaciones.
                                </Typography>
                            )}
                        </List>
                    )}
                </Box>
            </Drawer>
        </>
    );
}
