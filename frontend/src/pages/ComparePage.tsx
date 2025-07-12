import { Box, Button, useTheme } from '@mui/material';
import { BasePage } from './BasePage';
import { PropertyDetailsCompare } from '../app/property/components/propertyDetails/PropertyDetailsCompare';
import { usePropertiesContext } from '../app/property/context/PropertiesContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Modal } from '../app/shared/components/Modal';
import { InquiryForm } from '../app/property/components/inquiries/InquiryForm';
import { useState } from 'react';
import { ROUTES } from '../lib';

const Compare = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { clearComparison, comparisonItems } = usePropertiesContext();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  if (comparisonItems.length === 0) {
    clearComparison();
    return <Navigate to={ROUTES.HOME_APP} replace />;
  }

  const handleBack = () => {
    clearComparison();
    navigate(-1);
  };

  const { selectedPropertyIds } = usePropertiesContext();

  return (
    <BasePage>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: -4 }}>
        <Button variant="contained" color="primary" onClick={handleBack}>
          VOLVER
        </Button>
      </Box>

      <>
        <PropertyDetailsCompare comparisonItems={comparisonItems} />

        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 8 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setInquiryOpen(true)}
            sx={{
              py: 1.5,
              borderRadius: 2,
              backgroundColor: theme.palette.secondary.main,
              '&:hover': { backgroundColor: theme.palette.secondary.dark },
            }}
          >
            Consultar por estas propiedades
          </Button>
        </Box>

        <Modal
          open={inquiryOpen}
          title="Enviar consulta"
          onClose={() => setInquiryOpen(false)}
        >
          <InquiryForm
            propertyIds={selectedPropertyIds}
          />
        </Modal>
      </>

    </BasePage>
  );
};

export default Compare;
