import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Drawer, Box, Typography, Switch, List, ListItem, useTheme, useMediaQuery, Stack, Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";

import { useAuthContext } from "../context/AuthContext";
import {
  getUserNotificationPreferencesByUser,
  updateUserNotificationPreference,
  getAllNotifications,
  getNotificationsByUser,
} from "../services/notification.service";
import { NotificationType } from "../../user/types/notification";

type Preference = { id: number; type: NotificationType; enabled: boolean };
type NotificationItem = { id: number; type: NotificationType; date: string };

const TYPE_LABELS: Record<NotificationType, string> = {
  PROPIEDADNUEVA: "Nueva propiedad disponible",
  PROPIEDADINTERES: "Actualizaciones de interés",
};

const drawerWidth = 400;

/** Card visual unificado (sin hover) para historial (usuario/admin) */
function HistoryCard({ title, subtitle, right }: { title: string; subtitle: string; right?: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        height: 64,
        px: 2,
        py: 0,
        columnGap: 1.5,
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontSize: "0.95rem", fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: "0.85rem" }}>
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
        height: 64,
        px: 2,
        py: 0,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        boxShadow: theme.shadows[2],
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.12),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        columnGap: 1.5,
      }}
    >
      <Typography variant="body2" sx={{ fontSize: "0.95rem", fontWeight: 600 }}>
        {label}
      </Typography>
      <Switch size="small" checked={checked} onChange={onChange} />
    </Box>
  );
}

const SectionHeader = ({ title, secondary }: { title: string; secondary?: React.ReactNode }) => (
  <Box
    sx={{
      px: 3,
      pt: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1,
    }}
  >
    <Typography variant="overline" sx={{ letterSpacing: 2, color: "text.secondary" }}>
      {title}
    </Typography>
    {secondary}
  </Box>
);

const SectionBody = ({ children }: { children: React.ReactNode }) => <Box sx={{ px: 3, pb: 2 }}>{children}</Box>;

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  topOffsetMobile?: number;
  topOffsetDesktop?: number;
}

export default function SettingsDrawer({ open, onClose, topOffsetMobile = 0, topOffsetDesktop }: SettingsDrawerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const resolvedTopOffsetDesktop = topOffsetDesktop ?? topOffsetMobile;
  const appliedTopOffset = isMobile ? topOffsetMobile : resolvedTopOffsetDesktop;

  const { info, isAdmin, isTenant } = useAuthContext();
  const userId = info?.id || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fmtDate = useMemo(() => new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }), []);

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

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [notifications]
  );

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
      setError("No pudimos cargar los datos.");
      if (!isAdmin) setPreferences([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userId]);

  useEffect(() => {
    if (open) refresh(); // carga al abrir (sin botón de refresh)
  }, [open, refresh]);

  const handleTogglePref = (pref: Preference) => async (_e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setPreferences((prev) => prev.map((p) => (p.id === pref.id ? { ...p, enabled: checked } : p)));
    try {
      await updateUserNotificationPreference(pref.id, checked);
    } catch {
      setPreferences((prev) => prev.map((p) => (p.id === pref.id ? { ...p, enabled: !checked } : p)));
    }
  };

  const countToday = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return sortedNotifications.filter((n) => new Date(n.date).toLocaleDateString() === today).length;
  }, [sortedNotifications]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? "90%" : drawerWidth,
          display: "flex",
          flexDirection: "column",
          top: appliedTopOffset,
          height: `calc(100% - ${appliedTopOffset}px)`,
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          pt: 1,
          pb: 3,
          textAlign: "center",
          color: "black",
          bgcolor: alpha(theme.palette.primary.main, 0.3),
        }}
      >
        <Stack spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontSize: "1.6rem", fontWeight: 600, letterSpacing: 0.3 }}>
            Notificaciones
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {isAdmin ? "Visualizando actividad global" : `${countToday} notificaciones hoy`}
          </Typography>

          <Chip
            size="small"
            variant={"filled"}
            color={"secondary"}
            label={isAdmin ? "Administrador" : isTenant ? "Inquilino" : "Usuario"}
            clickable={false}
          />
        </Stack>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {!isAdmin && (
          <>
            <SectionHeader title="PREFERENCIAS" />
            <SectionBody>
              {loading ? (
                <Typography variant="body2" color="text.secondary">
                  Cargando…
                </Typography>
              ) : preferences.length ? (
                <Stack spacing={1}>
                  {preferences.map((pref) => (
                    <PrefRow
                      key={pref.id}
                      label={TYPE_LABELS[pref.type]}
                      checked={pref.enabled}
                      onChange={handleTogglePref(pref)}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin preferencias configuradas.
                </Typography>
              )}
            </SectionBody>
          </>
        )}

        <Box
          sx={{
            px: 3,
            py: 1,
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography variant="overline" sx={{ letterSpacing: 2, color: "text.secondary" }}>
            {`HISTORIAL${isAdmin ? " (RESUMEN)" : ""}`}
          </Typography>
          {isAdmin && (
            <Typography variant="overline" sx={{ letterSpacing: 2, color: "text.secondary" }}>
              ENVIOS
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 3,
            pt: 1,
            pb: 3,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            bgcolor: "background.default",
          }}
        >
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Cargando…
            </Typography>
          ) : (
            <List
              sx={{
                p: 0,
                display: "flex",
                flexDirection: "column",
                gap: 1,
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
                    <Typography variant="body2" color="text.secondary">
                      Sin actividad.
                    </Typography>
                  </ListItem>
                )
              ) : sortedNotifications.length ? (
                sortedNotifications.map((n) => (
                  <ListItem key={n.id} sx={{ p: 0 }}>
                    <HistoryCard title={TYPE_LABELS[n.type]} subtitle={fmtDate.format(new Date(n.date))} />
                  </ListItem>
                ))
              ) : (
                <ListItem sx={{ p: 0 }}>
                  <Typography variant="body2" color="text.secondary">
                    Sin notificaciones.
                  </Typography>
                </ListItem>
              )}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
