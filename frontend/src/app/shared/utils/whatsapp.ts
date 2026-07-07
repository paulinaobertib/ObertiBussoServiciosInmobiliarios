export const DEFAULT_WHATSAPP_MESSAGE = "Hola, quisiera realizar una consulta. Muchas gracias.";

export const buildPropertyWhatsAppMessage = (propertyTitle?: string | null, propertyUrl?: string | null) => {
  const title = propertyTitle?.trim();
  const url = propertyUrl?.trim();

  if (!title && !url) return DEFAULT_WHATSAPP_MESSAGE;

  const lines = ["Hola, quisiera consultar por esta propiedad:"];
  if (title) lines.push(`Nombre: ${title}`);
  if (url) lines.push(`Link: ${url}`);
  lines.push("Muchas gracias.");

  return lines.join("\n");
};
