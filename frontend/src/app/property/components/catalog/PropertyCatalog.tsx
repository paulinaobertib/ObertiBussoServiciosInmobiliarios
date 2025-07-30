import { useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Property } from '../../types/property';
import { useCatalog } from '../../hooks/useCatalog';
import { CatalogList } from './CatalogList';

interface Props {
  properties?: Property[];
  mode: 'normal' | 'edit' | 'delete';
  onFinishAction: () => void;
  selectionMode?: boolean;
  toggleSelection?: (id: number) => void;
  isSelected?: (id: number) => boolean;
}

export const PropertyCatalog = ({ properties, mode, onFinishAction, selectionMode = false, toggleSelection, isSelected, }: Props) => {

  const { propertiesList, handleClick, DialogUI, }
    = useCatalog({ onFinish: onFinishAction, externalProperties: properties, });

  // callback para los clicks en cards
  const onCardClick = useCallback(
    (prop: Property) => handleClick(mode, prop),
    [handleClick, mode]
  );

  // spinner mientras carga o mientras propertiesList sigue en null
  // if (loading || propertiesList === null) {
  //   return (
  //     <Box
  //       sx={{
  //         flex: 1,
  //         display: 'flex',
  //         alignItems: 'center',
  //         justifyContent: 'center',
  //         minHeight: 200,
  //       }}
  //     >
  //       <CircularProgress size={36}
  //       />
  //     </Box>
  //   );
  // }

  return (
    <>
      <CatalogList
        properties={propertiesList ?? []}
        selectionMode={selectionMode}
        toggleSelection={toggleSelection}
        isSelected={isSelected}
        onCardClick={onCardClick}
      />
      {DialogUI}
    </>
  );
};
