import { Property } from "../types/property";

const clean = (value?: string | null) => (value ?? "").trim();

export const formatPropertyAddress = (property: Property) => {
  const parts = [
    clean(property.street),
    clean(property.number),
    clean(property.neighborhood?.name ?? ""),
    clean(property.neighborhood?.city ?? ""),
    "Argentina",
  ].filter(Boolean);
  return parts.join(", ");
};

export const getMapLocation = (property: Property) => ({
  formattedAddress: formatPropertyAddress(property) || undefined,
  latitude: property.latitude ?? null,
  longitude: property.longitude ?? null,
});
