import { describe, expect, it } from "vitest";
import { DEFAULT_WHATSAPP_MESSAGE, buildPropertyWhatsAppMessage } from "../../utils/whatsapp";

describe("whatsapp utils", () => {
  it("arma el mensaje de consulta con nombre y link de la propiedad", () => {
    expect(buildPropertyWhatsAppMessage("Casa central", "https://example.com/properties/12")).toBe(
      [
        "Hola, quisiera consultar por esta propiedad:",
        "Nombre: Casa central",
        "Link: https://example.com/properties/12",
        "Muchas gracias.",
      ].join("\n")
    );
  });

  it("usa el mensaje por defecto cuando no hay datos de propiedad", () => {
    expect(buildPropertyWhatsAppMessage()).toBe(DEFAULT_WHATSAPP_MESSAGE);
  });
});
