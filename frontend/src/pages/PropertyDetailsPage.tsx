import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, IconButton, CircularProgress, Stack } from "@mui/material";
import { BasePage } from "./BasePage";
import { usePropertiesContext } from "../app/property/context/PropertiesContext";
import { PropertyDetails } from "../app/property/components/propertyDetails/PropertyDetails";
import { Modal } from "../app/shared/components/Modal";
import { InquiryForm } from "../app/property/components/inquiries/InquiryForm";
import { useAuthContext } from "../app/user/context/AuthContext";
import ReplyIcon from "@mui/icons-material/Reply";
import { buildRoute, ROUTES } from "../lib";
import { deleteProperty } from "../app/property/services/property.service";
import { useGlobalAlert } from "../app/shared/context/AlertContext";
import { useApiErrors } from "../app/shared/hooks/useErrors";
import { LoadingButton } from "@mui/lab";

const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProperty, loadProperty, refreshProperties } = usePropertiesContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useAuthContext();
  const alertApi: any = useGlobalAlert();
  const { handleError } = useApiErrors();

  useEffect(() => {
    const fetch = async () => {
      if (!id) {
        setError("ID de propiedad no proporcionado");
        setLoading(false);
        return;
      }
      localStorage.setItem("selectedPropertyId", id.toString());
      setLoading(true);
      setError(null);
      try {
        await loadProperty(Number(id));
      } catch {
        setError("Error al cargar la propiedad");
      } finally {
        setLoading(false);
      }
    };
    fetch();

    return () => {
      localStorage.removeItem("selectedPropertyId");
    };
  }, [id, loadProperty]);

  // ---- LOADING GLOBAL ----
  if (loading) {
    return (
      <BasePage>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
          <CircularProgress size={36} />
        </Box>
      </BasePage>
    );
  }

  // ---- ERROR GLOBAL ----
  if (error) {
    return (
      <BasePage>
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" color="error">
            {error}
          </Typography>
        </Box>
      </BasePage>
    );
  }

  const handleEditProperty = () => {
    if (!currentProperty) return;
    navigate(buildRoute(ROUTES.EDIT_PROPERTY, currentProperty.id));
  };

  const handleDeleteProperty = async () => {
    if (!currentProperty || deleting) return;
    const label = currentProperty.title ?? `propiedad #${currentProperty.id}`;

    let confirmed = true;
    if (typeof alertApi?.doubleConfirm === "function") {
      confirmed = await alertApi.doubleConfirm({
        kind: "error",
        description: `¿Vas a eliminar "${label}"?`,
      });
    } else if (typeof window !== "undefined") {
      confirmed = window.confirm(`¿Vas a eliminar "${label}"?`);
    }
    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteProperty(currentProperty);

      if (typeof alertApi?.success === "function") {
        await alertApi.success({
          title: "Propiedad eliminada",
          description: `"${label}" se eliminó correctamente.`,
          primaryLabel: "Volver",
        });
      }

      try {
        await refreshProperties("all");
      } catch (refreshError) {
        handleError(refreshError);
      }
      localStorage.removeItem("selectedPropertyId");

      navigate(ROUTES.HOME_APP);
    } catch (deleteError) {
      handleError(deleteError);
    } finally {
      setDeleting(false);
    }
  };

  // ---- CONTENIDO PRINCIPAL ----
  if (!currentProperty) return null;

  return (
    <>
      <IconButton
        size="small"
        onClick={() => navigate(-1)}
        sx={{ position: "absolute", top: 64, left: 8, zIndex: 1300, display: { xs: "none", sm: "inline-flex" } }}
      >
        <ReplyIcon />
      </IconButton>

      <BasePage>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          {!isAdmin ? (
            <Button variant="contained" onClick={() => setInquiryOpen(true)}>
              Consultar por esta propiedad
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={() => navigate(buildRoute(ROUTES.PROPERTY_NOTES, currentProperty.id))}
              >
                Ver notas de la propiedad
              </Button>

              <Button variant="outlined" onClick={handleEditProperty}>
                Editar propiedad
              </Button>

              <LoadingButton variant="outlined" color="error" loading={deleting} onClick={handleDeleteProperty}>
                Eliminar propiedad
              </LoadingButton>
            </Stack>
          )}
        </Box>

        {/* Detalle */}
        <PropertyDetails property={currentProperty} />

        {/* Modal para consulta */}
        <Modal open={inquiryOpen} title="Enviar consulta" onClose={() => setInquiryOpen(false)}>
          <InquiryForm propertyIds={[currentProperty.id]} />
        </Modal>
      </BasePage>
    </>
  );
};

export default PropertyDetailsPage;
