import { useState } from 'react';
import { InquiryForm } from '../app/property/components/inquiries/InquiryForm';
import { AppointmentForm } from '../app/user/components/appointments/user/AppointmentForm';
import { BasePage } from './BasePage';
import { Box, Typography, Button, useTheme, useMediaQuery, IconButton, } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
import ReplyIcon from '@mui/icons-material/Reply';

export default function ContactPage() {
    const theme = useTheme();
    const isMobile = !useMediaQuery(theme.breakpoints.up('md'));
    const [tab, setTab] = useState<'inquiry' | 'appointment'>('inquiry');
    const navigate = useNavigate();

    return (
        <>
            <IconButton
                size="small"
                onClick={() => navigate(-1)}
                sx={{ position: 'absolute', top: 64, left: 8, zIndex: 1300, display: { xs: 'none', sm: 'inline-flex' } }}
            >
                <ReplyIcon /> 
            </IconButton>

            <BasePage>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        flex: 1,
                        minHeight: 0,
                        overflow: 'hidden',
                    }}
                >
                    {/* Panel de consultas */}
                    {(!isMobile || tab === 'inquiry') && (
                        <Box
                            sx={{
                                flexBasis: { xs: '100%', md: '35%' },
                                display: 'flex',
                                flexDirection: 'column',
                                m: 2,
                                overflow: 'hidden',
                                minHeight: 0,
                                bgcolor: 'background.paper',
                                boxShadow: 4,
                                borderRadius: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                }}
                            >
                                <Typography variant="h5" align="center" sx={{ flex: 1 }}>Realizá tu consulta</Typography>
                                {isMobile && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => setTab('appointment')}
                                        endIcon={<ArrowForwardIosIcon fontSize="small" />}
                                    >
                                        Sacar turno
                                    </Button>
                                )}
                            </Box>

                            <Typography
                                variant="body2"
                                align="center"
                                sx={{ px: 3, pb: 1, color: 'text.secondary' }}
                            >
                                Completá el formulario para enviarnos tu consulta y nos comunicaremos a la brevedad.
                            </Typography>

                            <Box
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    overflowY: 'auto',
                                }}
                            >
                                <InquiryForm propertyIds={[]} />
                            </Box>
                        </Box>
                    )}

                    {/* Panel de turnos */}
                    {(!isMobile || tab === 'appointment') && (
                        <Box
                            sx={{
                                flexBasis: { xs: '100%', md: '65%' },
                                display: 'flex',
                                flexDirection: 'column',
                                m: 2,
                                overflow: 'hidden',
                                minHeight: 0,
                                bgcolor: 'background.paper',
                                boxShadow: 4,
                                borderRadius: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                }}
                            >
                                {isMobile && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => setTab('inquiry')}
                                        startIcon={<ArrowBackIosIcon fontSize="small" />}
                                    >
                                        Hacer consulta
                                    </Button>
                                )}
                                <Typography variant="h5" align="center" sx={{ flex: 1 }}>
                                    Reservá tu turno
                                </Typography>
                            </Box>

                            <Typography
                                variant="body2"
                                align="center"
                                sx={{ px: 3, pb: 1, color: 'text.secondary' }}
                            >
                                Seleccioná fecha y horario para solicitar un turno presencial.
                            </Typography>

                            <Box
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    overflowY: 'auto',
                                    p: 2,
                                }}
                            >
                                <AppointmentForm />
                            </Box>
                        </Box>
                    )}
                </Box>
            </BasePage>
        </>
    );
}
