import { Property } from "../types/property";

const clean = (value?: string | null) => (value ?? "").trim();

export const formatPropertyAddress = (property: Property) => {
  if (clean(property.formattedAddress)) return clean(property.formattedAddress);
  const parts = [
    clean(property.neighborhood?.name ?? ""),
    clean(property.neighborhood?.city ?? property.locality ?? ""),
    "Argentina",
  ].filter(Boolean);
  return parts.join(", ");
};

export const getMapLocation = (property: Property) => ({
  formattedAddress: formatPropertyAddress(property) || undefined,
  placeId: property.placeId || undefined,
  latitude: property.latitude ?? null,
  longitude: property.longitude ?? null,
});
