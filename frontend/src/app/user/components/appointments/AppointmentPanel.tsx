import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { Box, Button, Chip, Stack, Tooltip, Typography, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { getAllAvailabilities, deleteAvailability, getAppointmentsByStatus, updateAppointmentStatus } from '../../services/appointment.service';
import { getUserById } from '../../services/user.service';

import { Appointment, AvailableAppointment } from '../../types/appointment';
import { useAuthContext } from '../../../user/context/AuthContext';
import { Modal } from '../../../shared/components/Modal';
import { AppointmentGenerator } from './AppointmentGenerator';
import { User } from '../../types/user';

/* ─── filtros ─────────────────────────────────────────────────────── */

type Filters = 'TODOS' | 'DISPONIBLE' | 'ESPERA' | 'ACEPTADO' | 'RECHAZADO';

const FILTERS = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Disponibles', value: 'DISPONIBLE' },
  { label: 'Pendientes', value: 'ESPERA' },
  { label: 'Ocupados', value: 'ACEPTADO' },
  { label: 'Rechazados', value: 'RECHAZADO' },
] as const;

/* ─── helpers ─────────────────────────────────────────────────────── */

const isAppointment = (
  d: Appointment | AvailableAppointment | null,
): d is Appointment => !!d && 'status' in d;

/* ─── componente ──────────────────────────────────────────────────── */

export const AppointmentPanel = () => {
  const { isAdmin } = useAuthContext();

  const [slots, setSlots] = useState<AvailableAppointment[]>([]);
  const [apptsBySlot, setAppts] = useState<Record<number, Appointment>>(
    {},
  );
  const [filter, setFilter] = useState<Filters>('TODOS');
  const [loading, setLoading] = useState(false);

  const [modalMode, setModalMode] = useState<'gen' | 'info' | null>(null);
  const [modalData, setModalData] =
    useState<Appointment | AvailableAppointment | null>(null);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [btnLoading, setBtnLoading] = useState(false);

  /* ── 1) carga inicial ──────────────────────────────────────────── */

  const load = async () => {
    setLoading(true);
    try {
      const [
        slotsRes,
        pendRes,
        accRes,
        rejRes,
      ] = await Promise.all([
        getAllAvailabilities(),
        getAppointmentsByStatus('ESPERA'),
        getAppointmentsByStatus('ACEPTADO'),
        getAppointmentsByStatus('RECHAZADO'),
      ]);

      setSlots(slotsRes.data);

      const dict: Record<number, Appointment> = {};
      [...pendRes.data, ...accRes.data, ...rejRes.data].forEach(
        (a: Appointment) => {
          dict[a.availableAppointment.id] = a;
        },
      );
      setAppts(dict);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  /* ── 2) sets precalculados ─────────────────────────────────────── */

  const pendingIds = useMemo(
    () =>
      new Set(
        Object.values(apptsBySlot)
          .filter(a => a.status === 'ESPERA')
          .map(a => a.availableAppointment.id),
      ),
    [apptsBySlot],
  );

  const acceptedIds = useMemo(
    () =>
      new Set(
        Object.values(apptsBySlot)
          .filter(a => a.status === 'ACEPTADO')
          .map(a => a.availableAppointment.id),
      ),
    [apptsBySlot],
  );

  const rejectedIds = useMemo(
    () =>
      new Set(
        Object.values(apptsBySlot)
          .filter(a => a.status === 'RECHAZADO')
          .map(a => a.availableAppointment.id),
      ),
    [apptsBySlot],
  );

  const stateOf = (s: AvailableAppointment) =>
    s.availability
      ? 'DISPONIBLE'
      : pendingIds.has(s.id)
        ? 'PENDIENTE'
        : acceptedIds.has(s.id)
          ? 'ACEPTADO'
          : rejectedIds.has(s.id)
            ? 'RECHAZADO'
            : 'OCUPADO';

  /* ── 3) filtros y agrupado ─────────────────────────────────────── */

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

  /* ── 4) acciones de modal ─────────────────────────────────────── */

  const openSlot = async (s: AvailableAppointment) => {
    const data = apptsBySlot[s.id] ?? s;
    setModalData(data);
    setModalUser(null);
    setModalMode('info');
    if (isAppointment(data)) {
      try {
        const res = await getUserById(data.userId);
        setModalUser(res.data);
      } catch {
        /* noop */
      }
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

  const removeSlot = async (slotId: number) => {
    setBtnLoading(true);
    await deleteAvailability(slotId);
    await load();
    setBtnLoading(false);
    setModalMode(null);
  };

  /* ── 5) render ─────────────────────────────────────────────────── */

  if (!isAdmin) {
    return (
      <Typography align="center" sx={{ mt: 2 }} color="text.secondary">
        No tienes acceso.
      </Typography>
    );
  }

  return (
    <>
      {/* ─── barra superior ─── */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, px: 3, mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}
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

      {/* ─── grilla ─── */}
      <Box sx={{ px: 3 }}>
        {loading ? (
          <Typography>Cargando…</Typography>
        ) : dates.length === 0 ? (
          <Typography color="text.secondary">Sin turnos.</Typography>
        ) : (
          dates.map(d => (
            <Box key={d} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                {dayjs(d).format('DD/MM/YYYY')}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {byDate[d].map(s => (
                  <Tooltip key={s.id} title={stateOf(s)}>
                    <Button
                      size="small"
                      variant={s.availability ? 'contained' : 'outlined'}
                      color={
                        s.availability
                          ? 'success'
                          : pendingIds.has(s.id)
                            ? 'warning'
                            : acceptedIds.has(s.id)
                              ? 'info'
                              : rejectedIds.has(s.id)
                                ? 'error'
                                : undefined
                      }
                      sx={{ minWidth: 64 }}
                      onClick={() => openSlot(s)}
                    >
                      {s.date.slice(11, 16)}
                    </Button>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          ))
        )}
      </Box>

      {/* ─── modal Generar ─── */}
      <Modal
        open={modalMode === 'gen'}
        title="Generar turnos"
        onClose={() => setModalMode(null)}
      >
        <AppointmentGenerator onCreated={load} />
      </Modal>

      {/* ─── modal Info ─── */}
      <Modal
        open={modalMode === 'info'}
        title="Detalle del turno"
        onClose={() => setModalMode(null)}
      >
        {modalData && isAppointment(modalData) ? (
          <Box sx={{ p: 3, minWidth: 360 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography align="center" fontWeight={700}>
                  {modalUser?.firstName} {modalUser?.lastName}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2">Email</Typography>
                {modalUser?.email || '—'}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2">Teléfono</Typography>
                {modalUser?.phone || '—'}
              </Grid>

              {modalData.comment && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2">Comentario</Typography>
                  {modalData.comment}
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2">Estado</Typography>
                <Chip
                  label={modalData.status}
                  color={
                    modalData.status === 'ACEPTADO'
                      ? 'primary'
                      : modalData.status === 'ESPERA'
                        ? 'warning'
                        : 'error' /* RECHAZADO */
                  }
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              {modalData.status === 'ESPERA' && (
                <>
                  <LoadingButton
                    loading={btnLoading}
                    variant="contained"
                    onClick={() => acceptAppt(modalData)}
                  >
                    Aceptar
                  </LoadingButton>

                  <LoadingButton
                    loading={btnLoading}
                    variant="outlined"
                    color="error"
                    onClick={() => rejectOrCancel(modalData)}
                  >
                    Rechazar
                  </LoadingButton>
                </>
              )}

              {modalData.status === 'ACEPTADO' && (
                <LoadingButton
                  loading={btnLoading}
                  variant="outlined"
                  color="error"
                  onClick={() => rejectOrCancel(modalData)}
                >
                  Cancelar turno
                </LoadingButton>
              )}
            </Box>
          </Box>
        ) : modalData ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography mb={2}>Este turno se encuentra disponible.</Typography>
            <LoadingButton
              loading={btnLoading}
              variant="outlined"
              color="error"
              onClick={() => removeSlot((modalData as AvailableAppointment).id)}
            >
              Eliminar slot
            </LoadingButton>
          </Box>
        ) : null}
      </Modal>
    </>
  );
};
