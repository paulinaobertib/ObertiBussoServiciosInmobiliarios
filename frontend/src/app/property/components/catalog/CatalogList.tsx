import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useAuthContext } from '../../../user/context/AuthContext';
import { PropertyCard } from './PropertyCard';
import type { Property } from '../../types/property';

interface Props {
    properties: Property[];
    selectionMode?: boolean;
    toggleSelection?: (id: number) => void;
    isSelected?: (id: number) => boolean;
    onCardClick?: (property: Property) => void;
}

export const CatalogList = ({
    properties,
    selectionMode = false,
    toggleSelection = () => { },
    isSelected = () => false,
    onCardClick = () => { },
}: Props) => {
    const { isAdmin } = useAuthContext();

    // 1) Filtrado según permisos
    const filtered = useMemo(
        () =>
            isAdmin
                ? properties
                : properties.filter(
                    (p) => p.status?.toLowerCase() === 'disponible' || !p.status
                ),
        [properties, isAdmin]
    );

    // 2) Ordenar: primero outstanding por fecha, luego el resto por fecha
    const sorted = useMemo(() => {
        // Función genérica para ordenar por fecha descendente
        const byDateDesc = (a: Property, b: Property) =>
            new Date(b.date).getTime() - new Date(a.date).getTime();

        // Destacadas ordenadas por fecha
        const outstandingProps = filtered
            .filter((p) => p.outstanding)
            .sort(byDateDesc);

        // No destacadas ordenadas por fecha
        const normalProps = filtered
            .filter((p) => !p.outstanding)
            .sort(byDateDesc);

        // Concateno primero las destacadas y luego las demás
        return [...outstandingProps, ...normalProps];
    }, [filtered]);

    // 3) Mensaje si no hay nada
    if (sorted.length === 0) {
        return (
            <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                {isAdmin
                    ? 'No hay propiedades cargadas.'
                    : 'No hay propiedades disponibles.'}
            </Typography>
        );
    }

    return (
        <Box
            sx={{
                p: 2,
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                },
                gap: 4,
            }}
        >
            {sorted.map((prop) => (
                <PropertyCard
                    key={prop.id}
                    property={prop}
                    selectionMode={selectionMode}
                    toggleSelection={toggleSelection}
                    isSelected={isSelected}
                    onClick={() => onCardClick(prop)}
                />
            ))}
        </Box>
    );
};
