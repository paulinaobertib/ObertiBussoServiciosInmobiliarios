import { render, screen } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { MapSection } from "../../../../components/propertyDetails/maps/MapSection";

describe("MapSection", () => {
  const originalKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  beforeEach(() => {
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY = "test-key";
  });

  afterAll(() => {
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY = originalKey;
  });

  it("renderiza iframe cuando hay placeId", () => {
    render(<MapSection placeId="abc123" />);
    const iframe = screen.getByTitle(/Mapa de la propiedad/i) as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toContain("place_id:abc123");
    expect(iframe.src).toContain("test-key");
  });

  it("usa coordenadas cuando no hay placeId", () => {
    render(<MapSection latitude={-31.4} longitude={-64.2} />);
    const iframe = screen.getByTitle(/Mapa de la propiedad/i) as HTMLIFrameElement;
    expect(iframe.src).toContain("view?key=test-key&center=-31.4,-64.2");
  });

  it("muestra mensaje si no hay clave", () => {
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY = "";
    render(<MapSection formattedAddress="Córdoba" />);
    expect(screen.getByText(/Falta configurar/i)).toBeInTheDocument();
  });

  it("muestra mensaje si no hay datos de ubicación", () => {
    render(<MapSection />);
    expect(screen.getByText(/Ubicación no disponible/i)).toBeInTheDocument();
  });
});
