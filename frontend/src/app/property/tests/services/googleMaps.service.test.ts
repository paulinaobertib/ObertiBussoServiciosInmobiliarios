import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Ruta a tu servicio
const SERVICE_PATH = "../../services/googleMaps.service";

let fetchPlaceSuggestions: any;
let geocodeForward: any;
let reverseGeocode: any;
let parseAddressComponents: any;

// ===== CONFIGURACIÓN GLOBAL =====
beforeEach(async () => {
  vi.resetModules();

  // Mockear variable de entorno antes de importar el módulo
  vi.stubEnv("VITE_GOOGLE_MAPS_API_KEY", "fake-key");

  // Mock global de fetch y crypto
  global.fetch = vi.fn();
  Object.defineProperty(globalThis, "crypto", {
    value: { randomUUID: vi.fn(() => "uuid-1234") },
    configurable: true,
  });

  vi.spyOn(console, "error").mockImplementation(() => {});

  // Importar el módulo recién después del mock
  const mod = await import(SERVICE_PATH);
  fetchPlaceSuggestions = mod.fetchPlaceSuggestions;
  geocodeForward = mod.geocodeForward;
  reverseGeocode = mod.reverseGeocode;
  parseAddressComponents = mod.parseAddressComponents;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ===== TESTS =====

describe("fetchPlaceSuggestions", () => {
  it("retorna [] si el input está vacío", async () => {
    const res = await fetchPlaceSuggestions("   ", {});
    expect(res).toEqual([]);
  });

  it("retorna [] si fetch lanza un error", async () => {
    (fetch as any).mockRejectedValueOnce(new Error("network"));
    const res = await fetchPlaceSuggestions("Córdoba", {});
    expect(res).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Places autocomplete exception",
      expect.any(Error)
    );
  });

  it("retorna [] si response no ok", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      text: vi.fn().mockResolvedValue("error"),
    });
    const res = await fetchPlaceSuggestions("Córdoba", {});
    expect(res).toEqual([]);
  });

  it("retorna [] si json no tiene sugerencias válidas", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({ suggestions: null }),
    });
    const res = await fetchPlaceSuggestions("Córdoba", {});
    expect(res).toEqual([]);
  });

  it("mapea correctamente sugerencias válidas", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        suggestions: [
          {
            placePrediction: {
              placeId: "id1",
              structuredFormat: {
                mainText: { text: "Av. Colón" },
                secondaryText: { text: "Córdoba" },
              },
              text: { text: "Av. Colón, Córdoba" },
            },
          },
        ],
      }),
    });

    const res = await fetchPlaceSuggestions("col", { sessionToken: "token" });
    expect(res).toEqual([
      {
        id: "id1",
        placeId: "id1",
        mainText: "Av. Colón",
        secondaryText: "Córdoba",
        fullText: "Av. Colón, Córdoba",
      },
    ]);
  });

  it("descarta predicciones sin placeId o texto", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        suggestions: [{ placePrediction: { placeId: "", text: { text: "" } } }],
      }),
    });
    const res = await fetchPlaceSuggestions("col", {});
    expect(res).toEqual([]);
  });
});

describe("geocode helpers", () => {
  beforeEach(() => {
    // Mock global para todas las llamadas a geocode
    (fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "OK",
        results: [
          {
            formatted_address: "Córdoba, Argentina",
            place_id: "pid",
            geometry: { location: { lat: -31.4, lng: -64.18 } },
            address_components: [
              { long_name: "Córdoba", types: ["locality"] },
              { long_name: "Argentina", types: ["country"] },
            ],
            types: ["route"],
          },
        ],
      }),
    });
  });

  it("geocodeForward retorna null si no hay placeId ni address", async () => {
    const res = await geocodeForward({});
    expect(res).toBeNull();
  });

  it("geocodeForward usa placeId correctamente", async () => {
    const res = await geocodeForward({ placeId: "pid" });
    expect(res).toMatchObject({
      placeId: "pid",
      formattedAddress: "Córdoba, Argentina",
    });
  });

  it("geocodeForward usa address correctamente", async () => {
    const res = await geocodeForward({ address: "Córdoba" });
    expect(res?.lat).toBe(-31.4);
  });

  it("reverseGeocode llama correctamente", async () => {
    const res = await reverseGeocode(-31.4, -64.18);
    expect(res?.lng).toBe(-64.18);
  });

  it("retorna null si status no OK o sin resultados", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({ status: "ZERO_RESULTS", results: [] }),
    });
    const res = await geocodeForward({ address: "asdf" });
    expect(res).toBeNull();
  });

  it("maneja response no ok", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      text: vi.fn().mockResolvedValue("fail"),
    });
    const res = await geocodeForward({ address: "Cordoba" });
    expect(res).toBeNull();
  });

  it("retorna null si no hay geometry", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: "OK",
        results: [{ geometry: null }],
      }),
    });
    const res = await geocodeForward({ address: "Cordoba" });
    expect(res).toBeNull();
  });
});

describe("parseAddressComponents", () => {
  it("retorna los campos esperados", () => {
    const input = {
      route: "Av. Colón",
      street_number: "123",
      locality: "Córdoba",
      administrative_area_level_2: "Capital",
      sublocality: "Centro",
      administrative_area_level_1: "Córdoba",
      postal_code: "5000",
    };
    const res = parseAddressComponents(input);
    expect(res).toEqual({
      route: "Av. Colón",
      streetNumber: "123",
      locality: "Córdoba",
      neighborhood: "Centro",
      administrativeArea: "Córdoba",
      postalCode: "5000",
    });
  });

  it("maneja mapa vacío", () => {
    const res = parseAddressComponents({});
    expect(res).toEqual({
      route: "",
      streetNumber: "",
      locality: "",
      neighborhood: "",
      administrativeArea: "",
      postalCode: "",
    });
  });
});
