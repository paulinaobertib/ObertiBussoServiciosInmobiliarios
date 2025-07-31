export const getPropertyIdByTitle = (
  title: string, 
  properties: { id: number; title: string }[] // Lista de propiedades
): number | undefined => {
  console.log("Buscando propiedad con título:", title); // Verifica que el título se pasa correctamente
  const property = properties.find((p) => p.title === title);
  if (!property) {
    console.error("No se encontró la propiedad con el título:", title); // Verifica si la propiedad no se encuentra
  }
  return property ? property.id : undefined;
};