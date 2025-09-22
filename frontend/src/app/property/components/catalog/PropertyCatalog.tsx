import { useCallback } from "react";
import { Property } from "../../types/property";
import { useCatalog } from "../../hooks/useCatalog";
import { CatalogList } from "./CatalogList";

interface Props {
  properties?: Property[];
  mode: "normal" | "edit" | "delete";
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
}: Props) => {
  const { propertiesList, handleClick } = useCatalog({
    onFinish: onFinishAction,
    externalProperties: properties,
  });

  // callback para los clicks en cards
  const onCardClick = useCallback((prop: Property) => handleClick(mode, prop), [handleClick, mode]);

  return (
    <>
      <CatalogList
        properties={propertiesList ?? []}
        selectionMode={selectionMode}
        toggleSelection={toggleSelection}
        isSelected={isSelected}
        onCardClick={onCardClick}
      />
    </>
  );
};
