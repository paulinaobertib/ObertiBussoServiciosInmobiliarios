import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertiesContext } from '../context/PropertiesContext';
import { deleteProperty } from '../services/property.service';
import { useGlobalAlert } from '../../shared/context/AlertContext';
import { useConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Property } from '../types/property';
import { buildRoute, ROUTES } from '../../../lib';
import { useAuthContext } from '../../user/context/AuthContext';

export function useCatalog(onFinish: () => void) {
  const navigate = useNavigate();
  const { showAlert } = useGlobalAlert();
  const { ask, DialogUI } = useConfirmDialog();
  const {
    propertiesList: allProperties,
    loading,
    refreshProperties,
    selectedPropertyIds,
    toggleCompare,
  } = usePropertiesContext();
  const { isAdmin } = useAuthContext();

  const propertiesList = useMemo(
    () =>
      isAdmin
        ? allProperties
        : allProperties.filter((p) => p.status === 'DISPONIBLE'),
    [isAdmin, allProperties]
  );

  const [selectionMode, setSelectionMode] = useState(false);
  const [compareCount, setCompareCount] = useState(0);

  const toggleSelectionMode = () => {
    setSelectionMode((prev) => {
      if (prev) setCompareCount(0);
      return !prev;
    });
  };

  const onToggleCompare = (add: boolean) => {
    setCompareCount((c) => (add ? c + 1 : c - 1));
  };

  const onCompare = () => {
    // Navigation or comparison logic
  };

  const handleClick = (mode: 'normal' | 'edit' | 'delete', prop: Property) => {
    if (mode === 'edit') {
      navigate(buildRoute(ROUTES.EDIT_PROPERTY, prop.id));
      onFinish();
    } else if (mode === 'delete') {
      ask(`¿Eliminar "${prop.title}"?`, async () => {
        await deleteProperty(prop);
        showAlert('Propiedad eliminada con éxito!', 'success');
        await refreshProperties();
        onFinish();
      });
    } else {
      navigate(buildRoute(ROUTES.PROPERTY_DETAILS, prop.id));
      onFinish();
    }
  };

  return {
    propertiesList,
    loading,
    refresh: refreshProperties,
    selectedPropertyIds,
    toggleCompare,
    selectionMode,
    toggleSelectionMode,
    compareCount,
    onToggleCompare,
    onCompare,
    handleClick,
    DialogUI,
    isAdmin,
  };
}