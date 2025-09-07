const dict: Record<string, string> = {
  /* ─── catálogos ─── */
  amenity: "Caracteristica",
  owner: "Propietario",
  type: "Tipo",
  neighborhood: "Barrio",

  property: "Propiedad",
  maintenance: "Mantenimiento",
  comment: "Comentario",
};

export function translate(key: string) {
  return dict[key] ?? key;
}
