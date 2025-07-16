import React from 'react';
import { Box } from '@mui/material';
import { PropertyCarousel } from './PropertyCarousel';
import { Property } from '../../types/property';

interface Props {
    property: Property;
    InfoComponent: React.FC<{ property: Property }>;
    vertical?: boolean;
}

export const PropertyPanel = ({ property, InfoComponent, vertical = false }: Props) => {

    /* …cálculo de imágenes igual que antes… */
    const main = typeof property.mainImage === 'string'
        ? property.mainImage
        : (property.mainImage as any).url;
    const gallery = property.images.map(img =>
        typeof img === 'string' ? img : (img as any).url);
    const unique = Array.from(new Set([main, ...gallery]));
    const images = unique.map((url, i) => ({ id: i, url }));

    return (
        <Box
            sx={{
                height: '100%',
                backgroundColor: 'quaternary.main',
                borderRadius: 2,
                p: 3,
                display: 'flex',
                flexDirection: vertical ? 'column' : { xs: 'column', md: 'row' },

                gap: vertical ? 0 : 3,           // sin espacio extra en vertical

            }}
        >

            {/* Carrusel ocupa la mitad y estira */}
            <Box
                sx={{
                    minWidth: 0,
                    /* vertical → alto natural + margen; horizontal → ocupa 1 fr */
                    ...(vertical
                        ? { flexShrink: 0, mb: 2 }   // comparar
                        : { flex: 1 }                // detalle
                    ),
                }}
            >
                <PropertyCarousel
                    images={images.slice(1)}
                    mainImage={images[0].url}
                    title={property.title}
                />
            </Box>

            {/* Panel de info estira y hace scroll si se pasa */}
            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    overflowY: 'auto',
                }}
            >
                <InfoComponent property={property} />
            </Box>
        </Box>
    );
};
