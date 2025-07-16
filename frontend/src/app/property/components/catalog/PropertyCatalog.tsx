import { useMemo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useCatalog } from '../../hooks/useCatalog';
import { PropertyCard } from './PropertyCard';
import { Property } from '../../types/property';

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

  const list = properties ?? propertiesList;

  // 1️⃣ Ordenamos por date descendente
  const sortedList = useMemo(
    () =>
      [...list].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [list]
  );

  if (loading) return <CircularProgress size={48} />;
  if (!loading && sortedList.length === 0)
    return <Typography>No hay propiedades disponibles.</Typography>;

  return (
    <>
      <Box
        sx={{
          p: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
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
            onClick={() => handleClick(mode, prop)}
          />
        ))}
      </Box>
      {DialogUI}
    </>
  );
};
