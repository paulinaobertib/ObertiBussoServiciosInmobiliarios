import { useMemo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useCatalog } from '../../hooks/useCatalog';
import { PropertyCard } from './PropertyCard';
import { Property } from '../../types/property';
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
  const { propertiesList, loading, handleClick, DialogUI } =
    useCatalog(onFinishAction);

  // Extraemos directamente la bandera booleana isAdmin
  const { isAdmin } = useAuthContext();

  // 1️⃣ Lista base: la que venga por props o la del hook
  const list = properties ?? propertiesList;

  // 2️⃣ Filtrado: administradores ven todo; usuarios comunes sólo 'DISPONIBLE'
  const filtered = useMemo(() => {
    if (isAdmin) return list;
    return list.filter(
      p => p.status?.toLowerCase() === 'disponible'
    );
  }, [list, isAdmin]);

  // 3️⃣ Orden descendente por fecha
  const sortedList = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [filtered]
  );

  if (loading) return <CircularProgress size={48} />;

  if (!loading && sortedList.length === 0) {
    return (
      <Typography>
        {isAdmin
          ? 'No hay propiedades cargadas.'
          : 'No hay propiedades disponibles.'}
      </Typography>
    );
  }

  return (
    <>
      <Box
        sx={{
          p: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 3,
        }}
      >
        {sortedList.map(prop => (
          <PropertyCard
            key={prop.id}
            property={prop}
            selectionMode={selectionMode}
            toggleSelection={toggleSelection}
            isSelected={isSelected}
            onClick={() => handleClick(mode, prop)}
          />
        ))}
      </Box>
      {DialogUI}
    </>
  );
};
