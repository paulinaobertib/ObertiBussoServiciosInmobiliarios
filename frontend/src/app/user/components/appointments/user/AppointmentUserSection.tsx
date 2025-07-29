import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuthContext } from '../../../../user/context/AuthContext';
import { useAppointments } from '../../../hooks/useAppointments';
import { AppointmentUserList } from './AppointmentUserList';

export const AppointmentUserSection = () => {
  const { info } = useAuthContext();
  const { userLoading, userAppointments, slotMap, cancelAppointment, reloadUser } = useAppointments();

  // Carga inicial y recarga tras cancelación
  useEffect(() => {
    if (info) reloadUser();
  }, [info, reloadUser]);

  if (!info) return null;

  if (userLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: { xs: 2, sm: 3 },
      }}
    >

      {/* Lista */}
      <AppointmentUserList
        appointments={userAppointments}
        slotMap={slotMap}
        onCancel={cancelAppointment}
        reload={reloadUser}
      />
    </Box>
  );
};
