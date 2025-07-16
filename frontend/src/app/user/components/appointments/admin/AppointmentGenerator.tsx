import { Box, Stack, Typography, TextField, Divider, List, ListItem, Chip, useTheme } from '@mui/material';
import { Calendar } from '../../Calendar';
import { LoadingButton } from '@mui/lab';
import { useAppointments } from '../../../hooks/useAppoitments';

interface Props {
    onCreated: () => void;
}

export const AppointmentGenerator = ({ onCreated }: Props) => {
    const theme = useTheme();
    /* --- generator state del hook --- */
    const {
        genDate,
        setGenDate,
        genStartTime,
        setGenStartTime,
        genEndTime,
        setGenEndTime,
        genSlots,
        genLoading,
        genError,
        generateSlots,
    } = useAppointments();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* SUPERIOR */}
            <Box sx={{ flex: 1, display: 'flex', gap: 3 }}>
                <Box sx={{ flex: '0 0 300px', minWidth: 250 }}>
                    <Calendar onSelectDate={setGenDate} initialDate={genDate} />
                </Box>

                {/* LISTA */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle1">
                        Turnos <strong>{genDate.format('DD/MM/YYYY')}</strong>
                    </Typography>

                    {genLoading ? (
                        <Typography color="text.secondary">Cargando…</Typography>
                    ) : genSlots.length === 0 ? (
                        <Typography color="text.secondary">Sin turnos.</Typography>
                    ) : (
                        <Box sx={{ overflowY: 'auto', maxHeight: 5 * 56, pr: 0.5 }}>
                            <List disablePadding>
                                {genSlots.map((s) => (
                                    <ListItem key={s.id} disableGutters sx={{ py: 0.5 }}>
                                        <Box
                                            sx={{
                                                flex: 1,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                p: 0.8,
                                                borderRadius: 2,
                                                background: theme.palette.quaternary.main,
                                            }}
                                        >
                                            <Typography>Hora: {s.date.slice(11, 16)}</Typography>
                                            <Chip
                                                label={s.availability ? 'Libre' : 'Ocupado'}
                                                color={s.availability ? 'success' : 'error'}
                                                variant="outlined"
                                            />
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* INFERIOR */}
            <Box
                sx={{
                    mt: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Divider sx={{ width: '100%' }} />
                <Typography>
                    Crear turnos del <strong>{genDate.format('DD/MM/YYYY')}</strong>
                </Typography>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    <TextField
                        label="Desde"
                        type="time"
                        size="small"
                        fullWidth
                        value={genStartTime}
                        onChange={(e) => setGenStartTime(e.target.value)}
                    />
                    <TextField
                        label="Hasta"
                        type="time"
                        size="small"
                        fullWidth
                        value={genEndTime}
                        onChange={(e) => setGenEndTime(e.target.value)}
                    />
                </Stack>

                <LoadingButton
                    variant="contained"
                    onClick={async () => {
                        await generateSlots();
                        onCreated(); // avisa al padre
                    }}
                    disabled={genLoading}
                    sx={{ px: 4 }}
                >
                    Generar turnos
                </LoadingButton>

                {genError && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {genError}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};
