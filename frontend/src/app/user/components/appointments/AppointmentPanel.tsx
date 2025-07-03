import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Box, Button, Chip, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import {
  getAllAvailabilities,
  getAvailableAppointments,
  getAppointmentsByStatus,
  updateAppointmentStatus,
  deleteAvailability,
} from '../../services/appointment.service';
import { getUserById } from '../../services/user.service';

import { Appointment, AvailableAppointment, AppointmentStatus } from '../../types/appointment';
import { useAuthContext } from '../../../user/context/AuthContext';
import { Modal } from '../../../shared/components/Modal';
import { AppointmentGenerator } from './AppointmentGenerator';
import { User } from '../../types/user';

type Filters = 'TODOS' | 'DISPONIBLE' | 'ESPERA' | 'ACEPTADO' | 'RECHAZADO';
const FILTERS = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Disponibles', value: 'DISPONIBLE' },
  { label: 'Pendientes', value: 'ESPERA' },
  { label: 'Aceptados', value: 'ACEPTADO' },
  { label: 'Rechazados', value: 'RECHAZADO' },
] as const;

const isAppointment = (d: Appointment | AvailableAppointment | null): d is Appointment =>
  !!d && 'status' in d;

export const AppointmentPanel = () => {
  const { isAdmin } = useAuthContext();
  const [slots, setSlots] = useState<AvailableAppointment[]>([]);
  const [apptsBySlot, setAppts] = useState<Record<number, Appointment>>({});
  const [filter, setFilter] = useState<Filters>('TODOS');
  const [loading, setLoading] = useState(false);

  const [modalMode, setModalMode] = useState<'gen' | 'info' | null>(null);
  const [modalData, setModalData] = useState<Appointment | AvailableAppointment | null>(null);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      switch (filter) {
        case 'DISPONIBLE': {
          const res = await getAvailableAppointments();
          setSlots(res.data);
          setAppts({});
          break;
        }
        case 'ESPERA':
        case 'ACEPTADO':
        case 'RECHAZADO': {
          const status = filter as AppointmentStatus;
          const res = await getAppointmentsByStatus(status);
          const pseudo = res.data.map((a: { availableAppointment: { id: any; }; id: any; appointmentDate: any; }) => ({
            id: a.availableAppointment?.id ?? a.id,
            date: a.appointmentDate,
            availability: false,
          }));
          setSlots(pseudo);
          const dict: Record<number, Appointment> = {};
          res.data.forEach((a: Appointment) => {
            const key = a.availableAppointment?.id ?? a.id;
            dict[key] = a;
          });
          setAppts(dict);
          break;
        }
        case 'TODOS':
        default: {
          const [slotsRes, pendRes, accRes] = await Promise.all([
            getAllAvailabilities(),
            getAppointmentsByStatus('ESPERA'),
            getAppointmentsByStatus('ACEPTADO'),
          ]);
          setSlots(slotsRes.data);
          const dict: Record<number, Appointment> = {};
          pendRes.data.forEach((a: Appointment) => {
            if (a.availableAppointment) dict[a.availableAppointment.id] = a;
          });
          accRes.data.forEach((a: Appointment) => {
            if (a.availableAppointment) dict[a.availableAppointment.id] = a;
          });
          setAppts(dict);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, filter]);

  const pendingIds = useMemo(
    () =>
      new Set(
        Object.values(apptsBySlot)
          .filter(a => a.status === 'ESPERA')
          .map(a => a.availableAppointment?.id ?? a.id)
      ),
    [apptsBySlot]
  );
  const acceptedIds = useMemo(
    () =>
      new Set(
        Object.values(apptsBySlot)
          .filter(a => a.status === 'ACEPTADO')
          .map(a => a.availableAppointment!.id)
      ),
    [apptsBySlot]
  );
  const rejectedIds = useMemo(
    () =>
      new Set(
        Object.entries(apptsBySlot)
          .filter(([, a]) => a.status === 'RECHAZADO')
          .map(([slotId]) => Number(slotId))
      ),
    [apptsBySlot]
  );

  const stateOf = (s: AvailableAppointment) =>
    s.availability
      ? 'DISPONIBLE'
      : pendingIds.has(s.id)
        ? 'ESPERA'
        : acceptedIds.has(s.id)
          ? 'ACEPTADO'
          : rejectedIds.has(s.id)
            ? 'RECHAZADO'
            : 'OCUPADO';

  const visible = slots
    .filter(s => !dayjs(s.date).isBefore(dayjs().startOf('day')))
    .filter(s => {
      if (filter === 'TODOS') return true;
      if (filter === 'DISPONIBLE') return s.availability;
      if (filter === 'ESPERA') return pendingIds.has(s.id);
      if (filter === 'ACEPTADO') return acceptedIds.has(s.id);
      if (filter === 'RECHAZADO') return rejectedIds.has(s.id);
      return true;
    });

  const byDate = useMemo(() => {
    const g: Record<string, AvailableAppointment[]> = {};
    visible.forEach(s => {
      const d = s.date.slice(0, 10);
      (g[d] ||= []).push(s);
    });
    return g;
  }, [visible]);
  const dates = Object.keys(byDate).sort();

  const openSlot = async (s: AvailableAppointment) => {
    const data = apptsBySlot[s.id] ?? s;
    setModalData(data);
    setModalUser(null);
    setModalMode('info');
    if (isAppointment(data)) {
      try {
        const res = await getUserById(data.userId);
        setModalUser(res.data);
      } catch { }
    }
  };

  const acceptAppt = async (a: Appointment) => {
    setBtnLoading(true);
    await updateAppointmentStatus(a.id, 'ACEPTADO');
    await load();
    setBtnLoading(false);
    setModalMode(null);
  };
  const rejectOrCancel = async (a: Appointment) => {
    setBtnLoading(true);
    await updateAppointmentStatus(a.id, 'RECHAZADO');
    await load();
    setBtnLoading(false);
    setModalMode(null);
  };
  const removeSlot = async (id: number) => {
    setBtnLoading(true);
    await deleteAvailability(id);
    await load();
    setBtnLoading(false);
    setModalMode(null);
  };

  if (!isAdmin) {
    return (
      <Typography align="center" sx={{ mt: 2 }} color="text.secondary">
        No tienes acceso.
      </Typography>
    );
  }

  return (
    <>
      {/* Botón y filtros */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, px: 3, mt: 1, alignItems: 'center', gap: 1 }}
      >
        <Button variant="contained" onClick={() => setModalMode('gen')}>
          Generar turnos
        </Button>
        {FILTERS.map(f => (
          <Chip
            key={f.value}
            label={f.label}
            size="medium"
            clickable
            color={filter === f.value ? 'secondary' : 'default'}
            onClick={() => setFilter(f.value)}
          />
        ))}
      </Stack>

      {/* Listado de slots por fecha */}
      <Box sx={{ px: 3 }}>
        {loading ? (
          <Typography>Cargando…</Typography>
        ) : dates.length === 0 ? (
          <Typography color="text.secondary">Sin turnos.</Typography>
        ) : (
          dates.map(date => (
            <Box key={date} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                {dayjs(date).format('DD/MM/YYYY')}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
                  gap: 1,
                }}
              >
                {byDate[date].map(slot => {
                  const st = stateOf(slot);
                  return (
                    <Button
                      key={slot.id}
                      size="small"
                      variant={slot.availability ? 'contained' : 'outlined'}
                      color={
                        slot.availability ? 'success'
                          : st === 'ESPERA' ? 'warning'
                            : st === 'ACEPTADO' ? 'info'
                              : st === 'RECHAZADO' ? 'error'
                                : undefined
                      }
                      sx={{ minWidth: 64, height: 32 }}
                      onClick={() => openSlot(slot)}
                    >{slot.date.slice(11, 16)}</Button>
                  );
                })}
              </Box>
            </Box>
          ))
        )}
      </Box>


      {/* Modal Generar Turnos */}
      <Modal
        open={modalMode === 'gen'}
        title="Generar turnos"
        onClose={() => setModalMode(null)}
      >
        <AppointmentGenerator onCreated={load} />
      </Modal>

      {/* Modal Detalle de Turno */}
      <Modal
        open={modalMode === 'info'}
        title="Detalle del turno"
        onClose={() => setModalMode(null)}
      >
        {modalData && isAppointment(modalData) ? (
          <Box sx={{}}>

            {/* Tabla de detalles */}
            <TableContainer
              component={Box}
              sx={{
                '& td:first-of-type': {
                  borderRight: 1,
                  borderColor: 'divider',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                },
              }}
            >
              <Table size="small">
                <TableBody >
                  {/* Usuario */}
                  <TableRow >
                    <TableCell sx={{ fontWeight: 600, width: '30%' }}>Usuario</TableCell>
                    <TableCell>
                      {modalUser?.firstName} {modalUser?.lastName}
                    </TableCell>
                  </TableRow>
                  {/* Fecha */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell>
                      {dayjs(modalData.appointmentDate).format('DD/MM/YYYY')}
                    </TableCell>
                  </TableRow>
                  {/* Hora */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Hora</TableCell>
                    <TableCell>
                      {dayjs(modalData.appointmentDate).format('HH:mm')}
                    </TableCell>
                  </TableRow>
                  {/* Email */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell>{modalUser?.email || '—'}</TableCell>
                  </TableRow>
                  {/* Teléfono */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
                    <TableCell>{modalUser?.phone || '—'}</TableCell>
                  </TableRow>
                  {/* Comentario */}
                  {modalData.comment && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Comentario</TableCell>
                      <TableCell>{modalData.comment}</TableCell>
                    </TableRow>
                  )}
                  {/* Estado */}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Estado del Turno</TableCell>
                    <TableCell>{modalData.status}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Botones de acción */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1.5 }}>
              {modalData.status === 'ESPERA' && (
                <>
                  <LoadingButton
                    size="small"
                    loading={btnLoading}
                    variant="contained"
                    onClick={() => acceptAppt(modalData)}
                  >
                    Aceptar
                  </LoadingButton>
                  <LoadingButton
                    size="small"
                    loading={btnLoading}
                    variant="outlined"
                    color="error"
                    onClick={() => rejectOrCancel(modalData)}
                  >
                    Rechazar
                  </LoadingButton>
                </>
              )}

              {/* Solo en “ACEPTADO” */}
              {modalData.status === 'ACEPTADO' && (
                <LoadingButton
                  size="small"
                  fullWidth
                  loading={btnLoading}
                  variant="contained"
                  color="error"
                  onClick={() => rejectOrCancel(modalData)}
                  sx={{ maxWidth: 200 }}
                >
                  Cancelar turno
                </LoadingButton>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" gutterBottom>
              No hay turno para este slot.
            </Typography>
            <LoadingButton
              size="small"
              fullWidth
              loading={btnLoading}
              variant="contained"
              color="error"
              onClick={() => removeSlot((modalData as AvailableAppointment).id)}
              sx={{ maxWidth: 200 }}
            >
              Eliminar slot
            </LoadingButton>
          </Box>
        )}
      </Modal>
    </>
  );
};
