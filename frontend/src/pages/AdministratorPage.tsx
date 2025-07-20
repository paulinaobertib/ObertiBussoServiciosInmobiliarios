import { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { BasePage } from './BasePage';
import { PanelManager } from '../app/shared/components/PanelManager';
import { CategorySection } from '../app/property/components/categories/CategorySection';
import { PropertySection } from '../app/property/components/properties/PropertySection';
import { usePropertiesContext } from '../app/property/context/PropertiesContext';
import { ProfileSection } from "../app/user/components/users/profile/ProfileSection";
import { UsersSection } from '../app/user/components/users/panel/UsersSection';
import { AppointmentSection } from '../app/user/components/appointments/admin/AppointmentSection';
import { InquiriesSection } from '../app/property/components/inquiries/InquiriesSection';

export default function AdministratorPage() {
    const { resetSelected, pickItem } = usePropertiesContext();
    const navigate = useNavigate();

    useEffect(() => {
        pickItem('category', null);
        resetSelected();
    }, [pickItem, resetSelected]);

    const panels = [
        {
            key: 'property',
            label: 'PROPIEDADES',
            content: <PropertySection />,
        },
        {
            key: 'owner',
            label: 'PROPIETARIOS',
            content: <CategorySection category="owner" />,
        },
        {
            key: 'users',
            label: 'USUARIOS',
            content: <UsersSection />,
        },
        {
            key: 'inquiries',
            label: 'CONSULTAS',
            content: <InquiriesSection />,
        },
        {
            key: 'appointments',
            label: 'TURNERO',
            content: <AppointmentSection />,
        }
    ];

    return (
        <BasePage>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', my: 2 }}>
                <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                    VOLVER
                </Button>
            </Box>

            <ProfileSection />

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
