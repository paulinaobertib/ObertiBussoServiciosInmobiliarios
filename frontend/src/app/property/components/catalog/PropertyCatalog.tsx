import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

import { deleteProperty } from '../../services/property.service';
import { Property } from '../../types/property';
import { useGlobalAlert } from '../../../shared/context/AlertContext';
import { useConfirmDialog } from '../../utils/ConfirmDialog';
import { usePropertyCrud } from '../../context/PropertiesContext';
import { PropertyCard } from './PropertyCard';
import { buildRoute } from '../../../../lib';
import { ROUTES } from '../../../../lib';

type CatalogMode = 'normal' | 'edit' | 'delete';

interface Props {
  mode: CatalogMode;
  onFinishAction: () => void;
  properties?: Property[];
  selectionMode?: boolean;
  toggleSelection?: (id: number) => void;
  isSelected?: (id: number) => boolean;
}

export const PropertyCatalog = ({
  mode,
  onFinishAction,
  properties = [],
  selectionMode = false,
  toggleSelection = () => { },
  isSelected = () => false,
}: Props) => {
  const navigate = useNavigate();
  const { showAlert } = useGlobalAlert();
  const { ask, DialogUI } = useConfirmDialog();
  const { propertiesList, loading, refreshProperties } = usePropertyCrud();
  const [internalProperties, setInternalProperties] = useState<Property[]>([]);

  useEffect(() => {
    setInternalProperties(properties.length ? properties : propertiesList);
  }, [properties, propertiesList]);

  const handleCrudClick = (prop: Property) => {
    if (mode === 'edit') {
      navigate(buildRoute(ROUTES.EDIT_PROPERTY, prop.id))
      onFinishAction();
    } else if (mode === 'delete') {
      ask(`¿Eliminar "${prop.title}"?`, async () => {
        try {
          await deleteProperty(prop);
          showAlert('Propiedad eliminada con éxito!', 'success');
          await refreshProperties();
        } catch (e: any) {
          showAlert(e.response?.data ?? 'Error desconocido', 'error');
        }
        onFinishAction();
      });
    } else {
      navigate(buildRoute(ROUTES.PROPERTY_DETAILS, prop.id))
      onFinishAction();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!loading && internalProperties.length === 0) {
    return (
      <Typography sx={{ mt: 10, textAlign: 'center', color: 'text.secondary' }}>
        No hay propiedades disponibles.
      </Typography>
    );
  }

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 3,
            justifyContent: 'center',
          }}
        >
          {internalProperties.map(prop => (
            <Box key={prop.id} sx={{ width: '100%', maxWidth: 300 }}>

              <PropertyCard
                key={prop.id}
                property={prop}
                selectionMode={selectionMode}
                isSelected={isSelected!}
                toggleSelection={toggleSelection!}
                onClick={() => handleCrudClick(prop)}
              />
            </Box>

          ))}
        </Box>
      </Box>
      {DialogUI}
    </>
  );
}
