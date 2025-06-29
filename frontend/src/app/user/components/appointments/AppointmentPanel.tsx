import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Box,
  Typography,
  Grid,
  Stack,
  TextField,
  Button,
  useTheme
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import {
  getAllAvailabilities,
  createAvailability,
  getAppointmentsByStatus,
  updateAppointmentStatus
} from '../../services/appointment.service';
import {
  AvailableAppointment,
  AvailableAppointmentDTO,
  Appointment,
  AppointmentStatus
} from '../../types/appointment';
import { useAuthContext } from '../../../user/context/AuthContext';
import { Modal } from '../../../shared/components/Modal';

export default function AppointmentPanel() {
  const theme = useTheme();
  const { isAdmin } = useAuthContext();

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [slots, setSlots] = useState<AvailableAppointment[]>([]);
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('13:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState<Appointment | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Carga todos los slots y filtra por fecha
  const loadSlots = async () => {
    setLoading(true);
    try {
      // como el service devuelve un AxiosResponse,
      // extraemos aquí el .data que es el array
      const all = (await getAllAvailabilities()).data as AvailableAppointment[];
      const dateStr = selectedDate.format('YYYY-MM-DD');
      setSlots(all.filter(a => a.date.startsWith(dateStr)));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Genera nuevos slots (el backend los divide en 30')
  const handleCreate = async () => {
    setLoading(true);
    try {
      const dto: AvailableAppointmentDTO = {
        date: selectedDate.format('YYYY-MM-DD'),
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`
      };
      await createAvailability(dto);
      await loadSlots();
    } catch (err: any) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Al clickear un slot, abre modal con la solicitud en estado ESPERA
  const handleSlotClick = async (slot: AvailableAppointment) => {
    if (!isAdmin) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const pendings = (await getAppointmentsByStatus(
        'ESPERA' as AppointmentStatus
      )).data as Appointment[];
      const found = pendings.find(app => app.availableAppointment.id === slot.id);
      setAppointmentData(found || null);
      setModalOpen(true);
    } catch (err: any) {
      setModalError(err.response?.data || err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Aceptar o rechazar la solicitud
  const handleUpdateStatus = async (status: AppointmentStatus) => {
    if (!appointmentData) return;
    setModalLoading(true);
    setModalError(null);
    try {
      await updateAppointmentStatus(appointmentData.id, status);
      setModalOpen(false);
      setAppointmentData(null);
      await loadSlots();
    } catch (err: any) {
      setModalError(err.response?.data || err.message);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadSlots();
  }, [selectedDate, isAdmin]);

  if (!isAdmin) {
    return (
      <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
        No tienes acceso a este panel.
      </Typography>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Columna izquierda: calendario + creación */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                mb: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1
              }}
            >
              <Typography
                variant="subtitle1"
                align="center"
                sx={{ m: 1 }}
              >
                Seleccioná un día
              </Typography>
              <DateCalendar
                value={selectedDate}
                onChange={d => d && setSelectedDate(d)}
                disablePast
                sx={{ width: '100%' }}
              />
            </Box>
            <Box
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                alignItems: 'center',
                // gap: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                align="center"
                sx={{ mb: 1 }}
              >
                Crear turnos
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ alignItems: 'center' }}
              >
                <TextField
                  label="Desde"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Hasta"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  Generar
                </Button>
              </Stack>
            </Box>
          </Grid>

          {/* Columna derecha: muestra los slots */}
          <Grid size={{ xs: 12, sm: 8 }}>
            {loading ? (
              <Typography>Cargando…</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : slots.length === 0 ? (
              <Typography color="text.secondary" align="center">
                No hay turnos para este día.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: 1,
                }}
              >
                {slots.map(slot => {
                  const time = slot.date.slice(11, 16);
                  return (
                    <Button
                      key={slot.id}
                      variant={slot.availability ? 'contained' : 'outlined'}
                      onClick={() => handleSlotClick(slot)}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {time}
                    </Button>
                  );
                })}
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Modal para detalles de la solicitud */}
        <Modal
          open={modalOpen}
          title={
            appointmentData
              ? `Solicitud #${appointmentData.id}`
              : 'Sin solicitud'
          }
          onClose={() => setModalOpen(false)}
        >
          {modalLoading ? (
            <Typography>Cargando…</Typography>
          ) : modalError ? (
            <Typography color="error">{modalError}</Typography>
          ) : appointmentData ? (
            <Stack spacing={2}>
              <Typography>
                <strong>Usuario:</strong> {appointmentData.userId}
              </Typography>
              <Typography>
                <strong>Comentario:</strong>{' '}
                {appointmentData.comment || '—'}
              </Typography>
              <Typography>
                <strong>Estado:</strong> {appointmentData.status}
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 1 }}
              >
                <Button
                  variant="contained"
                  onClick={() =>
                    handleUpdateStatus('ACEPTADO')
                  }
                >
                  Aceptar
                </Button>
                <Button
                  variant="outlined"
                  onClick={() =>
                    handleUpdateStatus('RECHAZADO')
                  }
                >
                  Rechazar
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Typography>
              No hay solicitudes para este turno.
            </Typography>
          )}
        </Modal>
      </Box>
    </LocalizationProvider>
  );
}
