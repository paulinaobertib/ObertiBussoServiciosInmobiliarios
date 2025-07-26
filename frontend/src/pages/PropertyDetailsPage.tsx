import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { BasePage } from './BasePage';
import { usePropertiesContext } from '../app/property/context/PropertiesContext';
import { PropertyDetails } from '../app/property/components/propertyDetails/PropertyDetails';
import { Modal } from '../app/shared/components/Modal';
import { InquiryForm } from '../app/property/components/inquiries/InquiryForm';
import { useAuthContext } from '../app/user/context/AuthContext';
import ReplyIcon from '@mui/icons-material/Reply';
import { buildRoute, ROUTES } from '../lib';

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProperty, loadProperty } = usePropertiesContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    const fetch = async () => {
      if (!id) {
        setError('ID de propiedad no proporcionado');
        setLoading(false);
        return;
      }
      localStorage.setItem("selectedPropertyId", id.toString());
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
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: 'absolute', top: 64, left: 8, zIndex: 1300 }}
      >
        <ReplyIcon />
      </IconButton>

      <BasePage >
        <Box sx={{ display: 'flex', justifyContent: 'end', mt: 2, gap: 1 }}>
          {!isAdmin ? (
            <Button variant="contained" onClick={() => setInquiryOpen(true)}>
              Consultar por esta propiedad
            </Button>
          ) : (
            currentProperty && (
              <>
                <Button
                  variant="outlined"
                  onClick={() =>
                    navigate(buildRoute(ROUTES.PROPERTY_NOTES, currentProperty.id))
                  }
                >
                  Ver notas de la propiedad
                </Button>

              </>
            )
          )}
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

            {/* Modal que contiene el InquiryPanel */}
            <Modal open={inquiryOpen} title="Enviar consulta" onClose={() => setInquiryOpen(false)}  >
              <InquiryForm propertyIds={[currentProperty.id]} />
            </Modal>
          </>
        )}
      </BasePage>
    </>
  );
};
export default PropertyDetailsPage;
