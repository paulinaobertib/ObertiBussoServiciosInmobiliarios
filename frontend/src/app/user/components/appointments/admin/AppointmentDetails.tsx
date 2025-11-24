import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { Box, Typography, Chip, Divider, Stack, Button, CircularProgress } from "@mui/material";
import { AccessTime, Person, EmailOutlined, PhoneOutlined, ChatBubbleOutline } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Modal } from "../../../../shared/components/Modal";
import { useAppointments } from "../../../hooks/useAppointments";
import { getUserById } from "../../../services/user.service";
import type { User } from "../../../types/user";

interface Props {
  open: boolean;
  slotId: number | null;
  onClose: () => void;
  onAccept: (a: any) => Promise<void>;
  onReject: (a: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const AppointmentDetailsDialog = ({ open, slotId, onClose, onAccept, onReject, onDelete }: Props) => {
  const { slotMap, apptsBySlot, reloadAdmin } = useAppointments();
  const slot = slotId != null ? slotMap[slotId] : undefined;
  const appt = slotId != null ? apptsBySlot[slotId] : undefined;

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    if (open) reloadAdmin();
  }, [open, reloadAdmin]);

  useEffect(() => {
    setUser(null);
    setLoadingUser(false);
  }, [slotId]);

  useEffect(() => {
    if (appt?.userId) {
      setLoadingUser(true);
      getUserById(appt.userId)
        .then((res) => setUser(res.data))
        .catch(() => {})
        .finally(() => setLoadingUser(false));
    }
  }, [appt]);

  if (!slot) return null;

  const statusLabel = slot.availability
    ? "Disponible"
    : appt?.status === "ESPERA"
    ? "Pendiente"
    : appt?.status === "ACEPTADO"
    ? "Confirmado"
    : "Rechazado";

  const chipColor: "default" | "warning" | "info" | "error" = slot.availability
    ? "default"
    : statusLabel === "Pendiente"
    ? "warning"
    : statusLabel === "Confirmado"
    ? "info"
    : "error";

  const handleAction = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
      await reloadAdmin();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal open={open} title="Detalle del turno" onClose={onClose}>
      <Box
        sx={{
          p: 2,
          width: "100%",
          // Evita scroll horizontal en móviles
          maxWidth: { xs: "min(100vw - 32px, 520px)", sm: 560 },
          boxSizing: "border-box",
        }}
      >
        {/* Header: hora/fecha + chip (responsive) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
            alignItems: "center",
            rowGap: 1,
            columnGap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0, // permite que los textos se contraigan sin overflow
            }}
          >
            <AccessTime color="action" />
            <Typography variant="h6" sx={{ flexShrink: 0 }}>
              {dayjs(slot.date).format("HH:mm")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                // fecha larga en español sin romper layout
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                minWidth: 0,
              }}
            >
              {`- ${dayjs(slot.date).locale("es").format("dddd D [de] MMMM [de] YYYY")}`}
            </Typography>
          </Box>

          <Chip
            label={statusLabel}
            variant="outlined"
            color={chipColor}
            size="small"
            sx={{ justifySelf: { xs: "start", sm: "end" } }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Detalles: usuario y comentario */}
        {appt && (
          <Stack spacing={1.25} mb={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Person color="action" />
              <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                {loadingUser ? (
                  <CircularProgress size={16} aria-label="Cargando usuario" />
                ) : user ? (
                  `${user.firstName} ${user.lastName}`
                ) : (
                  "Cliente"
                )}
              </Typography>
            </Box>

            {user?.email && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailOutlined color="action" />
                <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                  {user.email}
                </Typography>
              </Box>
            )}

            {user?.phone && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneOutlined color="action" />
                <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                  {user.phone}
                </Typography>
              </Box>
            )}

            {appt.comment && (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <ChatBubbleOutline color="action" sx={{ mt: 0.3 }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: "italic",
                    whiteSpace: "pre-wrap", // respeta saltos de línea
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {appt.comment}
                </Typography>
              </Box>
            )}
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Botones de acción (wrap en móvil) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {slot.availability && (
            <Button
              loading={loading}
              variant="outlined"
              color="error"
              onClick={() => handleAction(() => onDelete(slot.id))}
              sx={{ minWidth: { xs: "100%", sm: 120 } }}
            >
              Eliminar
            </Button>
          )}

          {appt?.status === "ESPERA" && (
            <>
              <Button
                loading={loading}
                variant="outlined"
                color="error"
                onClick={() => handleAction(() => onReject(appt))}
                sx={{ minWidth: { xs: "100%", sm: 120 } }}
              >
                Rechazar
              </Button>
              <LoadingButton
                loading={loading}
                variant="contained"
                color="success"
                onClick={() => handleAction(() => onAccept(appt))}
                sx={{ minWidth: { xs: "100%", sm: 140 } }}
              >
                Confirmar
              </LoadingButton>
            </>
          )}

          {appt?.status === "ACEPTADO" && (
            <Button
              loading={loading}
              variant="outlined"
              color="warning"
              onClick={() => handleAction(() => onReject(appt))}
              sx={{ minWidth: { xs: "100%", sm: 140 } }}
            >
              Cancelar Turno
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};
