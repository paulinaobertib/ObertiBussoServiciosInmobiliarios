import { useEffect } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { BasePage } from './BasePage';
import { PanelManager } from '../app/shared/components/PanelManager';
import { usePropertiesContext } from '../app/property/context/PropertiesContext';

import ReplyIcon from '@mui/icons-material/Reply';
import { ROUTES } from '../lib';
import { ContractsSection } from '../app/user/components/contracts/ContractSection';
import { IncreasesPanel } from '../app/user/components/increases/IncreasesSection';
import { PaymentsSection } from '../app/user/components/payments/PaymentsSection';

export default function AdministratorPage() {
    const { resetSelected, pickItem } = usePropertiesContext();
    const navigate = useNavigate();

    useEffect(() => {
        pickItem('category', null);
        resetSelected();
    }, [pickItem, resetSelected]);

    const panels = [
        {
            key: 'newcontract',
            label: 'CREAR NUEVO CONTRATO',
            content: null,
            ButtonComponent: () => (
                <Button
                    variant='outlined'
                    onClick={() => navigate(ROUTES.NEW_CONTRACT)}
                    sx={{ textTransform: 'none', minWidth: 110 }}
                >
                    CREAR NUEVO
                </Button>
            ),
        }, {
            key: 'contracts',
            label: 'CONTRATOS',
            content: <ContractsSection />,
        },
        {
            key: 'increases',
            label: 'AUMENTOS',
            content: <IncreasesPanel />,
        },
        {
            key: 'payments',
            label: 'PAGOS',
            content: <PaymentsSection />,
        },
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
