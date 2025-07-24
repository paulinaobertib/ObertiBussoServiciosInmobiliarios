import { useEffect } from 'react';
import {
    Box,
    Typography,
    useTheme,
    CircularProgress,
} from '@mui/material';
import { useAuthContext } from '../../../../user/context/AuthContext';
import { useAppointments } from '../../../hooks/useAppointments';
import { AppointmentUserList } from './AppointmentUserList';


export const AppointmentUserSection = () => {
    const theme = useTheme();
    const { info } = useAuthContext();
    const APPOINTMENT_GRID = '1fr 1fr 2fr 1fr 150px';
    const {
        userLoading,
        userAppointments,
        slotMap,
        cancelAppointment,
        reloadUser,
    } = useAppointments();

    useEffect(() => {
        if (info) reloadUser();
    }, [info, reloadUser]);

    if (!info) return null;

  return (
   <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Column headers */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'grid' },
          gridTemplateColumns: APPOINTMENT_GRID,
          px: 2,
          py: 1,
          gap: 1,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography fontWeight={700}>Día</Typography>
        <Typography fontWeight={700}>Hora</Typography>
        <Typography fontWeight={700}>Descripción</Typography>
        <Typography fontWeight={700}>Estado</Typography>
        <Typography fontWeight={700} textAlign="right">
          Acción
        </Typography>
      </Box>

      {/* ───────── Zona de lista que se expande ───────── */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {userLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <AppointmentUserList
            appointments={userAppointments}
            slotMap={slotMap}
            onCancel={cancelAppointment}
            reload={reloadUser}
          />
        )}
      </Box>
    </Box>
  );
};