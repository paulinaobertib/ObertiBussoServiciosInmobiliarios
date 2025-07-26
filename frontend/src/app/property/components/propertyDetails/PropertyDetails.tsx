import { Container } from '@mui/material';
import { Property } from '../../types/property';
import { PropertyPanel } from './PropertyPanel';
import { PropertyInfo } from './PropertyInfo';
import { MapSection } from './maps/MapSection';

interface Props { property: Property }

export const PropertyDetails = ({ property }: Props) => {
    const address = property.neighborhood
        ? `${property.street}, ${property.neighborhood.name}, ${property.neighborhood.city}`
        : `${property.street}, Buenos Aires, Argentina`;

    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>
            <PropertyPanel property={property} InfoComponent={PropertyInfo} />
            <MapSection address={address} />
        </Container>
    );
};
