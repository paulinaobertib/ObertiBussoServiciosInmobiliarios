// src/pages/AppointmentPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    Button,
    Tabs,
    Tab,
    IconButton,
    Container,
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import AddIcon from '@mui/icons-material/Add';

import BasePage from './BasePage';
import { Calendar } from '../app/user/components/Calendar';
import { PendingAppointmentsList } from '../app/user/components/appointments/admin/PendingAppointmentList';
import { AppointmentSection } from '../app/user/components/appointments/admin/AppointmentSection';
import { GenerateSlotsDialog } from '../app/user/components/appointments/admin/AppointmentsSlotsGenerator';
import { AppointmentDetailsDialog } from '../app/user/components/appointments/admin/AppointmentDetails';
import { useAppointments } from '../app/user/hooks/useAppointments';

dayjs.locale('es');

export default function AppointmentPage() {
    const navigate = useNavigate();
    const {
        slotsByDate,
        apptsBySlot,
        filter,
        setFilter,
        acceptAppointment,
        rejectAppointment,
        removeAvailableSlot,
        loading,
        reloadAdmin,
    } = useAppointments();

    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [generateOpen, setGenerateOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
    const [tab, setTab] = useState<'pending' | 'all'>('pending');

    const dateKey = selectedDate.format('YYYY-MM-DD');
    const daySlots = slotsByDate[dateKey] ?? [];

    const stats = useMemo(() => {
        const disponible = daySlots.filter(s => s.availability).length;
        const espera = daySlots.filter(
            s => !s.availability && apptsBySlot[s.id]?.status === 'ESPERA'
        ).length;
        const aceptado = daySlots.filter(
            s => !s.availability && apptsBySlot[s.id]?.status === 'ACEPTADO'
        ).length;
        const rechazado = daySlots.filter(
            s => !s.availability && apptsBySlot[s.id]?.status === 'RECHAZADO'
        ).length;
        return { disponible, espera, aceptado, rechazado };
    }, [daySlots, apptsBySlot]);

    const handleSelectSlot = (id: number) => {
        setSelectedSlotId(id);
        setDetailsOpen(true);
    };

    useEffect(() => {
        if (tab === 'pending') {
            setFilter('TODOS');
        }
    }, [tab, setFilter]);

    return (
        <>
            <IconButton
                size="small"
                onClick={() => navigate(-1)}
                sx={{ position: 'absolute', top: 64, left: 8, zIndex: 1300 }}
            >
                <ReplyIcon />
            </IconButton>

            <BasePage>
                <Container sx={{ py: 2 }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Turnero de Visitas
                    </Typography>

                    {/* Layout: dos columnas en md+, columna única en xs */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 2,
                        }}
                    >
                        {/* Columna Izquierda: Calendario + Estadísticas */}
                        <Card
                            sx={{
                                flexShrink: 0,
                                flexBasis: { md: '350px' },
                                width: { xs: '100%', md: '350px' },
                                m: 1,
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <CardContent
                                sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}
                            >
                                <Typography variant="subtitle1" align="center" fontWeight="bold" gutterBottom>
                                    Calendario
                                </Typography>

                                <Calendar initialDate={selectedDate} onSelectDate={setSelectedDate} />

                                <Typography
                                    variant="subtitle1"
                                    align="center"
                                    fontWeight="bold"
                                    gutterBottom
                                    sx={{ mt: 2 }}
                                >
                                    Resumen de Turnos del Día
                                </Typography>

                                <Stack spacing={1} sx={{ mb: 2 }}>
                                    <Chip label={`Disponible: ${stats.disponible}`} variant="outlined" />
                                    <Chip label={`Pendientes: ${stats.espera}`} variant="outlined" />
                                    <Chip label={`Confirmados: ${stats.aceptado}`} variant="outlined" />
                                    <Chip label={`Rechazados: ${stats.rechazado}`} variant="outlined" />
                                </Stack>

                                <Box sx={{ mt: 'auto' }}>
                                    <Button
                                        startIcon={<AddIcon />}
                                        variant="contained"
                                        fullWidth
                                        onClick={() => setGenerateOpen(true)}
                                    >
                                        Generar turnos
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Columna Derecha: Tabs de Turnos */}
                        <Card sx={{ flexGrow: 1, p: 2 }}>
                            <Typography variant="subtitle1" align="center" fontWeight="bold" gutterBottom>
                                Listado de Turnos
                            </Typography>

                            <Tabs
                                value={tab}
                                onChange={(_, value) => setTab(value)}
                                indicatorColor="primary"
                                textColor="primary"
                                variant="fullWidth"
                            >
                                <Tab label="Pendientes" value="pending" />
                                <Tab label="POR DIA" value="all" />
                            </Tabs>

                            <Box sx={{ p: 2 }}>
                                {tab === 'pending' ? (
                                    <PendingAppointmentsList
                                        slotsByDate={slotsByDate}
                                        apptsBySlot={apptsBySlot}
                                        loading={loading}
                                        onSelect={handleSelectSlot}
                                    />
                                ) : (
                                    <AppointmentSection
                                        loading={loading}
                                        selectedDate={selectedDate}
                                        filter={filter}
                                        setFilter={setFilter}
                                        slotsByDate={slotsByDate}
                                        apptsBySlot={apptsBySlot}
                                        onSelectSlot={handleSelectSlot}
                                    />
                                )}
                            </Box>
                        </Card>
                    </Box>

                    {/* Diálogos */}
                    <GenerateSlotsDialog
                        open={generateOpen}
                        onClose={() => {
                            setGenerateOpen(false);
                            reloadAdmin();
                        }}
                    />

                    <AppointmentDetailsDialog
                        open={detailsOpen}
                        slotId={selectedSlotId}
                        onClose={() => {
                            setDetailsOpen(false);
                            setSelectedSlotId(null);
                        }}
                        onAccept={acceptAppointment}
                        onReject={rejectAppointment}
                        onDelete={removeAvailableSlot}
                    />
                </Container>
            </BasePage>
        </>
    );
}
