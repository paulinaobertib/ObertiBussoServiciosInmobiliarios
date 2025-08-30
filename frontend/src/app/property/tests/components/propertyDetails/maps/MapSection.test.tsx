/// <reference types="vitest" />
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect, Mock } from "vitest";
import axios from "axios";
import { MapSection } from "../../../../components/propertyDetails/maps/MapSection";

vi.mock("axios");
const mockedAxios = axios as unknown as { get: Mock };

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => <div>TileLayer</div>,
  Circle: () => <div>Circle</div>,
}));

describe("MapSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el loading inicialmente", async () => {
    // Mock para axios.get
    mockedAxios.get.mockResolvedValue({ data: [{ lat: "-31.4", lon: "-64.2" }] });

    render(<MapSection address="Calle Falsa 123" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    // Espera a que desaparezca el loader
    await waitFor(() =>
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    );
  });

  it("renderiza el mapa si encuentra coordenadas", async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ lat: "-31.4", lon: "-64.2" }] });

    render(<MapSection address="Calle Falsa 123" />);

    await waitFor(() =>
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    );

    expect(screen.getByText("TileLayer")).toBeInTheDocument();
    expect(screen.getByText("Circle")).toBeInTheDocument();
  });

  it("muestra mensaje de error si no encuentra coordenadas", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(<MapSection address="Dirección inexistente" />);

    await waitFor(() =>
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    );

    expect(screen.getByText(/Ubicación no encontrada/i)).toBeInTheDocument();
  });

it("abre Google Maps al hacer click en el botón", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [{ lat: "-31.4", lon: "-64.2" }],
    });

    window.open = vi.fn();

    render(<MapSection address="Calle Falsa 123" />);

    await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());

    const btn = screen.getByRole("button", { name: /Abrir en Maps/i });
    fireEvent.click(btn);

    expect(window.open).toHaveBeenCalledWith("https://www.google.com/maps?q=-31.4,-64.2", "_blank");
  });
});
