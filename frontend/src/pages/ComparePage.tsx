import { Box, Button, IconButton } from '@mui/material';
import { BasePage } from './BasePage';
import { PropertyDetailsCompare } from '../app/property/components/propertyDetails/PropertyDetailsCompare';
import { usePropertiesContext } from '../app/property/context/PropertiesContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Modal } from '../app/shared/components/Modal';
import { InquiryForm } from '../app/property/components/inquiries/InquiryForm';
import { useState } from 'react';
import { ROUTES } from '../lib';
import { useAuthContext } from '../app/user/context/AuthContext';
import { PropertyDTOAI } from '../app/property/types/property';
import { Comparer } from '../app/property/components/comparer/Comparer';
import ReplyIcon from '@mui/icons-material/Reply';

const Compare = () => {
  const navigate = useNavigate();
  const { clearComparison, comparisonItems } = usePropertiesContext();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const { isAdmin } = useAuthContext();

  if (comparisonItems.length === 0) {
    clearComparison();
    return <Navigate to={ROUTES.HOME_APP} replace />;
  }

  const handleBack = () => {
    clearComparison();
    navigate(-1);
  };

  const { selectedPropertyIds } = usePropertiesContext();

  const comparisonDataAI: PropertyDTOAI[] = comparisonItems.map((property) => ({
    name: property.title,
    address: `${property.street} ${property.number}, ${property.neighborhood.name}, ${property.neighborhood.city}, Argentina`,
    latitude: 0,
    longitude: 0,
    rooms: property.rooms,
    bathrooms: property.bathrooms,
    bedrooms: property.bedrooms,
    area: property.area,
    coveredArea: property.coveredArea,
    price: property.price,
    operation: property.operation,
    type: property.type.name,
    amenities: new Set(property.amenities.map((a) => a.name)),
  }));

  return (
    <>
      <IconButton
        size="small"
        onClick={handleBack}
        sx={{ position: 'relative', top: 64, left: 8, zIndex: 1300 }}
      >
        <ReplyIcon />
      </IconButton>

      <BasePage>

        <Box sx={{ display: 'flex', justifyContent: 'end', mt: 2, mb: -4 }}>
          {!isAdmin && (
            <Button variant="contained" color="primary" onClick={() => setInquiryOpen(true)}>
              Consultar por estas propiedades
            </Button>
          )}
        </Box>

        <PropertyDetailsCompare comparisonItems={comparisonItems} />

        <Box sx={{ position: "fixed", bottom: 16, left: 16, zIndex: 1300 }}>
          <Comparer data={comparisonDataAI} />
        </Box>

        <Modal open={inquiryOpen} title="Enviar consulta" onClose={() => setInquiryOpen(false)} >
          <InquiryForm propertyIds={selectedPropertyIds} />
        </Modal>

      </BasePage>
    </>
  );
};

export default Compare;
