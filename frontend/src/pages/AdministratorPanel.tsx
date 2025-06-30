import { useEffect } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { BasePage } from './BasePage';
import { PanelManager } from '../app/shared/components/PanelManager';
import { CategoryPanel } from '../app/property/components/CategoryPanel';
import { PropertyPanel } from '../app/property/components/PropertyPanel';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';
import { UserForm } from '../app/user/components/UserForm';
import { InquiriesPanel } from '../app/property/components/inquiries/InquiriesPanel';
import { AppointmentPanel } from '../app/user/components/appointments/AppointmentPanel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function AdministratorPanel() {
    const { resetSelected, pickItem } = usePropertyCrud();
    const navigate = useNavigate();

    useEffect(() => {
        pickItem('category', null);
        resetSelected();
    }, [pickItem, resetSelected]);

    const handleBack = () => navigate('/');

    const panels = [
        {
            key: 'property',
            label: 'PROPIEDADES',
            content: <PropertyPanel />,
        },
        {
            key: 'owner',
            label: 'PROPIETARIOS',
            content: <CategoryPanel category="owner" />,
        },
        {
            key: 'users',
            label: 'USUARIOS',
            content: <CategoryPanel category="owner" />,
        },
        {
            key: 'inquiries',
            label: 'CONSULTAS',
            content: <InquiriesPanel />,
        },
        {
            key: 'appointments',
            label: 'TURNERO',
            content: <AppointmentPanel />,
        }
    ];

    return (
        <BasePage maxWidth={true}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleBack}>
                    VOLVER
                </Button>
            </Box>

                        <Accordion disableGutters
                sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 4,
                    borderRadius: 2,
                }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        '& .MuiAccordionSummary-content': {
                            flex: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                        '& .MuiAccordionSummary-expandIconWrapper': {
                            marginLeft: 1,
                        },
                    }}
                >
                    <Typography variant="h6">Mis Datos</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <UserForm />
                </AccordionDetails>
            </Accordion>


            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    overflow: { xs: 'hidden', sm: 'auto' },
                    mt: 2,
                    mb: 2,
                }}
            >
                {/* Contenedor dinámico */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    <PanelManager panels={panels} direction="row" />
                </Box>
            </Box>
        </BasePage>
    );
}
