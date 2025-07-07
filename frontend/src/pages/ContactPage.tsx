import { useState } from 'react';
import { InquiryForm } from '../app/property/components/forms/InquiryForm';
import { AppointmentForm } from '../app/user/components/appointments/AppointmentForm';
import { BasePage } from './BasePage';
import { Box, Typography, Button } from '@mui/material';

export default function ContactPage() {
    const [formVisible, setFormVisible] = useState(true);

    const handleFormDone = () => {
        setFormVisible(false);
    };

    const handleReset = () => {
        setFormVisible(true);
    };

    return (
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
                    <Typography variant="h5" align="center" sx={{ p: 2 }}>
                        Realizá tu consulta
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ px: 3, pb: 1, color: 'text.secondary' }}>
                        Completá el formulario para enviarnos tu consulta y nos comunicaremos a la brevedad.
                    </Typography>

                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            p: 2,
                        }}
                    >
                        {formVisible ? (
                            <InquiryForm
                                propertyIds={[]}
                                onDone={handleFormDone}
                            />
                        ) : (
                            <Box
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    p: 2,
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    ¡Consulta enviada con éxito!
                                </Typography>
                                <Button variant="contained" onClick={handleReset}>
                                    Enviar otra consulta
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Panel de turnos */}
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
                    <Typography variant="h5" align="center" sx={{ p: 2 }}>
                        Reservá tu turno
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ px: 3, pb: 1, color: 'text.secondary' }}>
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
            </Box>
        </BasePage>
    );
}
