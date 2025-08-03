import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { AppointmentItem } from './AppointmentItem';
import type { AvailableAppointment, Appointment } from '../../../types/appointment';

interface Props {
  slotsByDate: Record<string, AvailableAppointment[]>;
  apptsBySlot: Record<number, Appointment>;
  loading: boolean;
  onSelect: (slotId: number) => void;
}

export const PendingAppointmentsList = ({
  slotsByDate,
  apptsBySlot,
  loading,
  onSelect,
}: Props) => {
  // Aplana, filtra pendientes y ordena
  const pendingSlots = useMemo<AvailableAppointment[]>(() => {
    const all = Object.values(slotsByDate).flat();
    return all
      .filter(s => apptsBySlot[s.id]?.status === 'ESPERA')
      .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  }, [slotsByDate, apptsBySlot]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Cargando turnos pendientes…</Typography>
      </Box>
    );
  }

  if (pendingSlots.length === 0) {
    return (
      <Typography color="text.secondary" align="center">
        No hay turnos pendientes.
      </Typography>
    );
  }

  return (
    <Box>
      {pendingSlots.map(slot => (
        <AppointmentItem
          key={slot.id}
          slot={slot}
          appt={apptsBySlot[slot.id]}
          onClick={onSelect}
        />
      ))}
    </Box>
  );
};
