import { useState, useEffect } from 'react';
import { BasePage } from './BasePage';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography, } from '@mui/material';
import { useAuthContext } from '../app/user/context/AuthContext';
import { FavoritesPanel } from '../app/user/components/favorites/FavoritesPanel'
import { PanelManager } from '../app/shared/components/PanelManager';
import { InquiriesPanel } from '../app/property/components/inquiries/InquiriesPanel';
import { AppointmentUser } from '../app/user/components/appointments/user/AppointmentUser';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { User } from '../app/user/types/user';
import { ProfileSection } from '../app/user/components/users/profile/ProfileSection';

export default function UserProfilePage() {
    const { info } = useAuthContext();
    const [, setForm] = useState<User>({
        id: '', userName: '', email: '', firstName: '', lastName: '', phone: ''
    });

    const panels = [
        {
            key: 'favorites',
            label: 'MIS FAVORITOS',
            content: <FavoritesPanel />,
        },
        {
            key: 'inquiries',
            label: 'MIS CONSULTAS',
            content: <InquiriesPanel />,
        },
        {
            key: 'appointment',
            label: 'MIS TURNOS',
            content: <AppointmentUser />,
        }
    ];

    /* ─────────────────────────  Sincronizar con contexto ───────────────────────── */
    useEffect(() => {
        if (!info) return;
        setForm({
            id: info.id,
            userName: info.userName,
            email: info.email,
            firstName: info.firstName,
            lastName: info.lastName,
            phone: info.phone ?? '',
        });
    }, [info]);

    /* ───────────────────────────────  UI  ───────────────────────────────────────── */
    return (
        <BasePage maxWidth>
            <Accordion disableGutters defaultExpanded
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
                    <ProfileSection />
                </AccordionDetails>
            </Accordion>

            {/* Resto de paneles */}
            <Box sx={{ mt: 2, flexGrow: 1, overflow: 'auto' }}>
                <PanelManager panels={panels} direction="row" />
            </Box>
        </BasePage >
    );
}