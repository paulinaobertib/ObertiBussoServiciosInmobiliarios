const labels = {
  amenity: "Servicio",
  owner: "Propietario",
  type: "Tipo de Propiedad",
  neighborhood: "Barrio",
} as const;

export type CategoryKey = keyof typeof labels;

export function translate(key: CategoryKey): string {
  return labels[key];
}

