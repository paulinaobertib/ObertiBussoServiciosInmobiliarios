import { Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BasePage } from './BasePage';
import { PanelManager } from '../app/shared/components/PanelManager';
import { PropertySection } from '../app/property/components/properties/PropertySection';
import ReplyIcon from '@mui/icons-material/Reply';

export default function TenantPage() {
    const navigate = useNavigate();

    const panels = [
        {
            key: 'property',
            label: 'MIS PROPIEDADES',
            content: <PropertySection />,
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
