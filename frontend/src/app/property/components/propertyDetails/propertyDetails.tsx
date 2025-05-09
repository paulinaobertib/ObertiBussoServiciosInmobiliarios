import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import ImageCarousel from '../propertyDetails/carousel';
import PropertyInfo from '../propertyDetails/propertyInfo';
import { Property } from '../../types/property';

interface PropertyDetailsProps {
  property: Property;
}

const PropertyDetails = ({ property }: PropertyDetailsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 3,
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ width: isMobile ? '100%' : '50%', flexShrink: 0 }}>
          <ImageCarousel
            images={property.images}
            mainImage={property.mainImage}
            title={property.title}
          />
        </Box>
        <Box sx={{ width: isMobile ? '100%' : '50%' }}>
          <PropertyInfo property={property} />
        </Box>
      </Box>
    </Container>
  );
};

export default PropertyDetails;