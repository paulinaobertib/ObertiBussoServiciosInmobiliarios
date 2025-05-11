/*  SOLO estas 4 claves, en singular  */
export const labels = {
  amenity:      'Servicio',
  owner:        'Propietario',
  type:         'Tipo de Propiedad',
  neighborhood: 'Barrio',
} as const;

export type CategoryKey = keyof typeof labels;   // 'amenity' | 'owner' | ...
export const translate = (k: CategoryKey) => labels[k];