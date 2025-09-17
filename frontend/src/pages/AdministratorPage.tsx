import { useEffect } from 'react';
import { Button, IconButton } from '@mui/material';
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
import { SurveysSection } from '../app/property/components/survey/SurveySection';

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
            label: 'Propiedades',
            content: <PropertySection selectable={false} />,
        },
        {
            key: 'owner',
            label: 'Propietarios',
            content: <CategorySection category="owner" selectable={false} />,
        },
        {
            key: 'users',
            label: 'Usuarios',
            content: <UsersSection selectable={false} />,
        },
        {
            key: 'inquiries',
            label: 'Consultas',
            content: <InquiriesSection />,
        },
        {
            key: 'surveys',
            label: 'Valoraciones',
            content: <SurveysSection />,
        },
        {
            key: 'appointments',
            label: 'Turnero',
            content: null,
            ButtonComponent: () => (
                <Button
                    variant='outlined'
                    onClick={() => navigate(ROUTES.APPOINTMENTS)}
                >
                    Turnero
                </Button>
            ),
        },
        {
            key: 'contracts',
            label: 'Contratos',
            content: null,
            ButtonComponent: () => (
                <Button
                    variant='outlined'
                    onClick={() => navigate(ROUTES.CONTRACT)}
                >
                    Contratos
                </Button>
            ),
        },
        {
            key: 'statistics',
            label: 'Estadisticas',
            content: null,
            ButtonComponent: () => (
                <Button
                    variant='outlined'
                    onClick={() => navigate(ROUTES.STATS)}
                >
                    Estadisticas
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
                <PanelManager panels={panels} direction="row" />
            </BasePage>
        </>
    );
}
