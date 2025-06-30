import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { BasePage } from './BasePage';
import { usePropertyCrud } from '../app/property/context/PropertiesContext';
import PropertyDetails from '../app/property/components/propertyDetails/PropertyDetails';
import { Modal } from '../app/shared/components/Modal';
import { InquiriesPanel } from '../app/property/components/inquiries/InquiriesPanel';

const PropertyDetailsPage = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProperty, loadProperty } = usePropertyCrud();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);


  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetch = async () => {
      if (!id) {
        setError('ID de propiedad no proporcionado');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await loadProperty(Number(id));
      } catch {
        setError('Error al cargar la propiedad');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, loadProperty]);

  return (
    <BasePage maxWidth={false}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: -4 }}>
        <Button variant="contained" color="primary" onClick={handleBack}>
          VOLVER
        </Button>
      </Box>

      {loading && (
        <Box sx={{ p: 4 }}>
          <Typography variant="h5">Cargando...</Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {!loading && !error && currentProperty && (
        <>
          {/* Aquí se muestra el detalle */}
          <PropertyDetails property={currentProperty} />

          {/* Botón para abrir el InquiryPanel */}
          <Box sx={{ mt: 4, textAlign: 'center', pb: 8 }}>
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
              Consultar por esta propiedad
            </Button>
          </Box>

          {/* Modal que contiene el InquiryPanel */}
          <Modal
            open={inquiryOpen}
            title="Enviar consulta"
            onClose={() => setInquiryOpen(false)}
          >
            <InquiriesPanel
              propertyIds={[currentProperty.id]}
              onDone={() => setInquiryOpen(false)}
            />
          </Modal>
        </>
      )}
    </BasePage>
  );
};
export default PropertyDetailsPage;
