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
            label: 'PROPIEDADES',
            content: <PropertySection selectable={false} />,
        },
        {
            key: 'owner',
            label: 'PROPIETARIOS',
            content: <CategorySection category="owner" selectable={false} />,
        },
        {
            key: 'users',
            label: 'USUARIOS',
            content: <UsersSection selectable={false} />,
        },
        {
            key: 'inquiries',
            label: 'CONSULTAS',
            content: <InquiriesSection />,
        },
        {
            key: 'surveys',
            label: 'VALORACIONES',
            content: <SurveysSection />,
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
        },
        {
            key: 'statistics',
            label: 'ESTADISTICAS',
            content: null,
            ButtonComponent: () => (
                <Button
                    variant='outlined'
                    onClick={() => navigate(ROUTES.STATS)}
                    sx={{ textTransform: 'none', minWidth: 110 }}
                >
                    ESTADISTICAS
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
