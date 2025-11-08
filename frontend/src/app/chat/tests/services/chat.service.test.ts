import { describe, it, vi, expect, beforeEach } from "vitest";
import { createChat } from "../../services/chat.service";
import { api } from "../../../../api";

// Mock del cliente api
vi.mock("../../../../api", () => ({
  api: {
    post: vi.fn(),
  },
}));

describe("Servicio createChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("realiza una solicitud POST y devuelve los datos correctamente", async () => {
    const mockResponse = { data: { message: "Respuesta del sistema" } };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await createChat("TEST_OPTION", 123, 1);

    expect(api.post).toHaveBeenCalledWith("/properties/chat/message", null, {
      params: { option: "TEST_OPTION", propertyId: 123, sessionId: 1 },
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("lanza un error cuando la solicitud POST falla", async () => {
    const mockError = new Error("Error en la API");
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    // Suprimir el console.error para evitar que aparezca en la salida de la prueba
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(createChat("TEST_OPTION", 123, 1)).rejects.toThrow("Error en la API");

    expect(api.post).toHaveBeenCalledWith("/properties/chat/message", null, {
      params: { option: "TEST_OPTION", propertyId: 123, sessionId: 1 },
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error creating chat:", mockError);

    consoleErrorSpy.mockRestore();
  });

  it("envía los parámetros correctos en la solicitud POST", async () => {
    const mockResponse = { data: { message: "Otra respuesta" } };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    await createChat("ANOTHER_OPTION", 456, 2);

    expect(api.post).toHaveBeenCalledWith("/properties/chat/message", null, {
      params: { option: "ANOTHER_OPTION", propertyId: 456, sessionId: 2 },
    });
  });
});
