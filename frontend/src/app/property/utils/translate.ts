const dict: Record<string, string> = {
  /* ─── catálogos ─── */
  amenity: "Servicio",
  owner: "Propietario",
  type: "Tipo",
  neighborhood: "Barrio",

  /* ─── VISTAS nuevas ─── */
  property: "Propiedad",
  maintenance: "Mantenimiento",
  comment: "Comentario",
};

export function translate(key: string) {
  return dict[key] ?? key;
}
