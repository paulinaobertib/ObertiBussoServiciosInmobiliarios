/// <reference types="vitest" />
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { AddressSelector, AddressSelectorProps } from "../../../../components/propertyDetails/maps/AddressSelector";
import * as neighborhoodService from "../../../../services/neighborhood.service";

vi.mock("../../../../services/neighborhood.service", () => ({
  getNeighborhoodById: vi.fn(),
}));

global.fetch = vi.fn();

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => <div>TileLayer</div>,
  Circle: () => <div>Circle</div>,
  GeoJSON: () => <div>GeoJSON</div>,
  useMapEvents: () => ({}),
}));

describe("AddressSelector", () => {
  const defaultProps: AddressSelectorProps = {
    neighborhoodId: 1,
    neighborhoodName: "Centro",
    value: { street: "", number: "" },
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de getNeighborhoodById
    (neighborhoodService.getNeighborhoodById as any).mockResolvedValue({
      latitude: -31.4,
      longitude: -64.2,
    });

    // Mock de fetch para Nominatim
    (fetch as any).mockResolvedValue({
      json: async () => [
        { geojson: { type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] } },
      ],
    });
  });

  it("renderiza los campos de calle y número", async () => {
    render(<AddressSelector {...defaultProps} />);
    expect(await screen.findByLabelText(/Calle/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Número/i)).toBeInTheDocument();
  });

  it("permite escribir en los campos", async () => {
    render(<AddressSelector {...defaultProps} />);
    const calle = await screen.findByLabelText(/Calle/i);

    fireEvent.change(calle, { target: { value: "Belgrano" } });
    expect(defaultProps.onChange).toHaveBeenCalledWith({ street: "Belgrano", number: "" });

    const numero = screen.getByLabelText(/Número/i);
    fireEvent.change(numero, { target: { value: "123" } });
    expect(defaultProps.onChange).toHaveBeenCalledWith({ street: "", number: "123" });
  });

});
