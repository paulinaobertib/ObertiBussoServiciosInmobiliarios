import { Box } from "@mui/material";
import { Property } from "../../types/property";
import { PropertyPanel } from "./PropertyPanel";
import { PropertyInfo } from "./PropertyInfo";
import { MapSection } from "./maps/MapSection";
import { getMapLocation } from "../../utils/propertyLocation";

interface Props {
  property: Property;
}

export const PropertyDetails = ({ property }: Props) => {
  const location = getMapLocation(property);

  return (
    <Box py={2}>
      <PropertyPanel property={property} InfoComponent={PropertyInfo} />
      <MapSection {...location} />
    </Box>
  );
};
