import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MapSection } from "../../../../components/propertyDetails/maps/MapSection";

// ✅ Mock dentro del callback (no usa variables externas)
vi.mock("../../../../utils/googleMapsLoader", () => {
  const mockMap = vi.fn(() => ({
    setCenter: vi.fn(),
    setZoom: vi.fn(),
  }));
  const mockCircle = vi.fn(() => ({
    setMap: vi.fn(),
  }));

  return {
    loadGoogleMapsSdk: vi.fn().mockResolvedValue({
      maps: {
        Map: mockMap,
        Circle: mockCircle,
      },
    }),
  };
});

describe("MapSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Muestra mensaje si no hay coordenadas", () => {
    render(<MapSection />);
    expect(screen.getByText(/Ubicación no disponible/i)).toBeInTheDocument();
  });

  it("Muestra overlay de carga y luego lo quita cuando se resuelve el loader", async () => {
    render(<MapSection latitude={-31.4} longitude={-64.2} />);
    expect(screen.getByLabelText(/Cargando mapa/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByLabelText(/Cargando mapa/i)).not.toBeInTheDocument());
  });

  it("Muestra mensaje de error si el loader falla", async () => {
    const { loadGoogleMapsSdk } = await import("../../../../utils/googleMapsLoader");
    vi.mocked(loadGoogleMapsSdk).mockRejectedValueOnce(new Error("SDK error"));

    render(<MapSection latitude={-31.4} longitude={-64.2} />);

    await waitFor(() =>
      expect(screen.getByText(/Ubicación no disponible/i)).toBeInTheDocument()
    );
  });

  it("Vuelve a mostrar 'Ubicación no disponible' si faltan lat/lng incluso con placeId", async () => {
    render(<MapSection placeId="abc123" />);
    expect(screen.getByText(/Ubicación no disponible/i)).toBeInTheDocument();
  });
});
