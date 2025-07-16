import { Container, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Property } from '../../types/property';
import { PropertyPanel } from './PropertyPanel';
import PropertyInfoCompare from './PropertyInfoCompare';
import { MapSection } from './maps/MapSection';

interface Props { comparisonItems: Property[] }

export const PropertyDetailsCompare = ({ comparisonItems }: Props) => {
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('md'));

    if (comparisonItems.length < 2 || comparisonItems.length > 3) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                    Selecciona 2 o 3 propiedades para comparar.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 8, px: 2 }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: mobile
                        ? '1fr'
                        : `repeat(${comparisonItems.length}, minmax(0, 1fr))`,
                    gap: 2,
                }}
            >
                {comparisonItems.map((prop) => {
                    const address = prop.neighborhood
                        ? `${prop.street}, ${prop.neighborhood.name}, ${prop.neighborhood.city}`
                        : `${prop.street}, Buenos Aires, Argentina`;

                    return (
                        <Box key={prop.id} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <PropertyPanel
                                property={prop}
                                InfoComponent={PropertyInfoCompare}
                                vertical
                            />
                            <MapSection address={address} />
                        </Box>
                    );
                })}
            </Box>
        </Container>
    );
};
