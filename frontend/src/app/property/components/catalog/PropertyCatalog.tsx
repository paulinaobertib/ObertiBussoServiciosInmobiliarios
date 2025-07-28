// src/app/property/components/catalog/PropertyCatalog.tsx
import { useMemo, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { PropertyCard } from './PropertyCard';
import { Property } from '../../types/property';
import { useCatalog } from '../../hooks/useCatalog';
import { useAuthContext } from '../../../user/context/AuthContext';

interface CatalogProps {
  properties?: Property[];
  mode: 'normal' | 'edit' | 'delete';
  onFinishAction: () => void;
  selectionMode?: boolean;
  toggleSelection?: (id: number) => void;
  isSelected?: (id: number) => boolean;
}

export const PropertyCatalog = ({
  properties,
  mode,
  onFinishAction,
  selectionMode = false,
  toggleSelection,
  isSelected,
}: CatalogProps) => {
  /* ---------------------- hooks SIEMPRE en el mismo orden ---------------------- */
  const {
    propertiesList,        // null | Property[]
    loading,
    handleClick,
    DialogUI,
  } = useCatalog(onFinishAction, properties);

  const { isAdmin } = useAuthContext();

  // lista filtrada (disponibles si no es admin)
  const filtered = useMemo(() => {
    if (!propertiesList) return [];
    return isAdmin
      ? propertiesList
      : propertiesList.filter(
        (p) => p.status?.toLowerCase() === 'disponible' || !p.status
      );
  }, [propertiesList, isAdmin]);

  // lista ordenada por fecha desc
  const sortedList = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [filtered]
  );

  // callback para los clicks en cards
  const onCardClick = useCallback(
    (prop: Property) => handleClick(mode, prop),
    [handleClick, mode]
  );

  /* ---------------------- renders condicionales ---------------------- */

  // spinner mientras carga o mientras propertiesList sigue en null
  if (loading || propertiesList === null) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress size={48} sx={{ animationDuration: '10s' }}  // 1 s es el default; 2 s = va a la mitad de velocidad
        />
      </Box>
    );
  }

  // mensaje de vacío (solo después de que loading sea false)
  if (sortedList.length === 0) {
    return (
      <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>
        {isAdmin
          ? 'No hay propiedades cargadas.'
          : 'No hay propiedades disponibles.'}
      </Typography>
    );
  }

  // grilla de propiedades
  return (
    <>
      <Box
        sx={{
          p: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {sortedList.map((prop) => (
          <PropertyCard
            key={prop.id}
            property={prop}
            selectionMode={selectionMode}
            toggleSelection={toggleSelection}
            isSelected={isSelected}
            onClick={() => onCardClick(prop)}
          />
        ))}
      </Box>

      {DialogUI}
    </>
  );
};
