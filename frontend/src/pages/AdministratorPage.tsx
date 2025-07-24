import { useEffect } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { BasePage } from './BasePage';
import { PanelManager } from '../app/shared/components/PanelManager';
import { CategorySection } from '../app/property/components/categories/CategorySection';
import { PropertySection } from '../app/property/components/properties/PropertySection';
import { usePropertiesContext } from '../app/property/context/PropertiesContext';
import { ProfileSection } from "../app/user/components/users/profile/ProfileSection";
import { UsersSection } from '../app/user/components/users/panel/UsersSection';
import { InquiriesSection } from '../app/property/components/inquiries/InquiriesSection';
import ReplyIcon from '@mui/icons-material/Reply';
import { ROUTES } from '../lib';

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
            content: null,
            ButtonComponent: () => (
                <Button
                    variant='outlined'
                    onClick={() => navigate(ROUTES.APPOINTMENTS)}
                    sx={{ textTransform: 'none', minWidth: 110 }}
                >
                    TURNERO
                </Button>
            ),
        },
        {
            key: 'contracts',
            label: 'CONTRATOS',
            content: null,
            ButtonComponent: () => (
                <Button
                    variant='outlined'
                    onClick={() => navigate(ROUTES.CONTRACT)}
                    sx={{ textTransform: 'none', minWidth: 110 }}
                >
                    CONTRATOS
                </Button>
            ),
        }
    ];

    return (
        <>
            <IconButton
                size="small"
                onClick={() => navigate(-1)}
                sx={{ position: 'relative', top: 64, left: 8, zIndex: 1300 }}
            >
                <ReplyIcon />
            </IconButton>

            <BasePage>

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
        </>
    );
}
