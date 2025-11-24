import dayjs from "dayjs";
import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import { useAppointments } from "../../../hooks/useAppointments";
import { AppointmentCard } from "./AppointmentCard";
import { EmptyState } from "../../../../shared/components/EmptyState";

export const AppointmentUser = () => {
  const { userLoading, userAppointments, slotMap, cancelAppointment } = useAppointments();

  if (userLoading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress aria-label="Cargando turnos" />
      </Box>
    );
  }

  if (userAppointments.length === 0) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <EmptyState title="No hay turnos disponibles." />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2}>
        {userAppointments
          .filter((a) => a.availableAppointment?.id != null && slotMap[a.availableAppointment.id])
          .sort((a, b) => dayjs(slotMap[a.availableAppointment.id].date).diff(slotMap[b.availableAppointment.id].date))
          .map((a) => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              slot={slotMap[a.availableAppointment.id]}
              onCancel={cancelAppointment}
            />
          ))}
      </Stack>
    </Box>
  );
};
