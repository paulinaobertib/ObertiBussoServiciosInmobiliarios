const labels = {
  amenity: "Servicios",
  owner: "Propietarios",
  type: "Tipos",
  neighborhood: "Barrios",
} as const;

export type CategoryKey = keyof typeof labels;

export function translate(key: CategoryKey): string {
  return labels[key];
}
