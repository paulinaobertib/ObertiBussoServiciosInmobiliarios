import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Property } from '../../types/property';
import { PropertyPanel } from './PropertyPanel';
import PropertyInfoCompare from './PropertyInfoCompare';
import { MapSection } from './maps/MapSection';
import { EmptyState } from '../../../shared/components/EmptyState';

interface Props { comparisonItems: Property[] }

export const PropertyDetailsCompare = ({ comparisonItems }: Props) => {
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('md'));

    if (comparisonItems.length < 2 || comparisonItems.length > 3) {
        return (
            <Box maxWidth="lg" sx={{ py: 6 }}>
                <EmptyState
                    title="No hay suficientes propiedades para comparar."
                    description="Selecciona entre dos y tres propiedades del catálogo para ver la comparación."
                />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 2 }}>
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
        </Box>
    );
};
