export const translateCategory = (category: string) => {
  switch (category) {
    case "owner":
      return "Propietario";
    case "amenity":
      return "Servicio";
    case "type":
      return "Tipo de Propiedad";
    case "neighborhood":
      return "Barrio";
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
};
