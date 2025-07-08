import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    useTheme,
    ToggleButtonGroup,
    ToggleButton,
    Menu,
    MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useAppointments } from '../../../hooks/useAppoitments';
import { useAuthContext } from '../../../../user/context/AuthContext';
import { Modal } from '../../../../shared/components/Modal';
import { AppointmentGenerator } from './AppointmentGenerator';
import { getUserById } from '../../../services/user.service';
import type { Appointment, AvailableAppointment } from '../../../types/appointment';
import type { User } from '../../../types/user';
import { AppointmentList } from './AppointmentList';

/* ─── Filtros disponibles ─── */
const FILTERS = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Disponibles', value: 'DISPONIBLE' },
    { label: 'Pendientes', value: 'ESPERA' },
    { label: 'Aceptados', value: 'ACEPTADO' },
    { label: 'Rechazados', value: 'RECHAZADO' },
] as const;

/* type-guard */
const isAppointment = (
    d: Appointment | AvailableAppointment | null,
): d is Appointment => !!d && 'status' in d;

export const AppointmentSection = () => {
    const theme = useTheme();
    const { isAdmin } = useAuthContext();

    const {
        adminLoading,
        filter,
        setFilter,
        slotsByDate,
        apptsBySlot,
        acceptAppointment,
        rejectAppointment,
        removeAvailableSlot,
        reloadAdmin,
    } = useAppointments();

    /* ── toolbar menú móvil ── */
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    /* ── modales ── */
    const [modalMode, setModalMode] = useState<'gen' | 'info' | null>(null);
    const [modalData, setModalData] = useState<Appointment | AvailableAppointment | null>(null);
    const [modalUser, setModalUser] = useState<User | null>(null);
    const [btnLoading, setBtnLoading] = useState(false);

    /* ── helpers ── */
    const appointmentOf = (slot: AvailableAppointment) => apptsBySlot[slot.id];
    const statusColor = (s: AvailableAppointment) => {
        if (s.availability) return 'success';
        const appt = appointmentOf(s);
        if (!appt) return undefined;
        return appt.status === 'ESPERA'
            ? 'warning'
            : appt.status === 'ACEPTADO'
                ? 'info'
                : appt.status === 'RECHAZADO'
                    ? 'error'
                    : undefined;
    };

    const openSlot = async (slot: AvailableAppointment) => {
        const appt = appointmentOf(slot);
        setModalData(appt ?? slot);
        setModalUser(null);
        setModalMode('info');
        if (appt) {
            try {
                const res = await getUserById(appt.userId);
                setModalUser(res.data);
            } catch {
            }
        }
    };

    const exec = async (fn: () => Promise<void>) => {
        setBtnLoading(true);
        await fn();
        await reloadAdmin();
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
            {/* ─── Toolbar ─── */}
            <Box
                sx={{
                    px: 2,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                {/* filtros desktop */}
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <ToggleButtonGroup
                        value={filter}
                        exclusive
                        size="small"
                        onChange={(_, v) => v && setFilter(v)}
                    >
                        {FILTERS.map((f) => (
                            <ToggleButton key={f.value} value={f.value}>
                                {f.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                {/* filtros mobile */}
                <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
                    <Button variant="outlined" size="small" onClick={handleMenuOpen}>
                        Filtros
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={handleMenuClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    >
                        {FILTERS.map((f) => (
                            <MenuItem
                                key={f.value}
                                selected={filter === f.value}
                                onClick={() => {
                                    setFilter(f.value);
                                    handleMenuClose();
                                }}
                            >
                                {f.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>

                {/* espacio */}
                <Box sx={{ flexGrow: 1 }} />

                {/* botón generar */}
                <Button variant="contained" size="small" onClick={() => setModalMode('gen')}>
                    Generar turnos
                </Button>
            </Box>

            {/* ─── Listado ─── */}
            <Box sx={{ py: 1 }}>
                {adminLoading ? (
                    <Typography>Cargando…</Typography>
                ) : (
                    <AppointmentList
                        slotsByDate={slotsByDate}
                        statusColor={statusColor}
                        onSelect={openSlot}
                    />
                )}
            </Box>

            {/* ─── Modal Generar ─── */}
            <Modal
                open={modalMode === 'gen'}
                title="Generar turnos"
                onClose={() => setModalMode(null)}
            >
                <AppointmentGenerator
                    onCreated={() => {
                        reloadAdmin();
                        setModalMode(null);
                    }}
                />
            </Modal>

            {/* ─── Modal Detalle ─── */}
            <Modal
                open={modalMode === 'info'}
                title="Detalle del turno"
                onClose={() => setModalMode(null)}
            >
                {modalData && isAppointment(modalData) ? (
                    // cita existente
                    <Box>
                        <TableContainer component={Box}>
                            <Table size="small">
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                                        <TableCell>
                                            {modalUser?.firstName} {modalUser?.lastName}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                                        <TableCell>
                                            {dayjs(modalData.appointmentDate).format('DD/MM/YYYY')}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Hora</TableCell>
                                        <TableCell>
                                            {dayjs(modalData.appointmentDate).format('HH:mm')}
                                        </TableCell>
                                    </TableRow>
                                    {modalData.comment && (
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Comentario</TableCell>
                                            <TableCell>{modalData.comment}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* acciones */}
                        <Box sx={{ mt: 3, display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                            {modalData.status === 'ESPERA' && (
                                <>
                                    <LoadingButton
                                        size="small"
                                        loading={btnLoading}
                                        variant="contained"
                                        onClick={() => exec(() => acceptAppointment(modalData))}
                                    >
                                        Aceptar
                                    </LoadingButton>
                                    <LoadingButton
                                        size="small"
                                        loading={btnLoading}
                                        variant="outlined"
                                        color="error"
                                        onClick={() => exec(() => rejectAppointment(modalData))}
                                    >
                                        Rechazar
                                    </LoadingButton>
                                </>
                            )}
                        </Box>
                    </Box>
                ) : (
                    // slot libre
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" gutterBottom>
                            No hay cita asignada.
                        </Typography>
                        <LoadingButton
                            size="small"
                            loading={btnLoading}
                            variant="contained"
                            color="error"
                            onClick={() =>
                                exec(() => removeAvailableSlot((modalData as AvailableAppointment).id))
                            }
                        >
                            Eliminar slot
                        </LoadingButton>
                    </Box>
                )}
            </Modal>
        </>
    );
};
