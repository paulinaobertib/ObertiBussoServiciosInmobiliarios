/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect, Mock } from "vitest";
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
  const fetchMock = fetch as unknown as Mock;

  const polygon = {
    type: "Polygon",
    coordinates: [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ],
  };

  const createDeferred = <T,>() => {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    fetchMock.mockReset();
    // Mock de getNeighborhoodById
    (neighborhoodService.getNeighborhoodById as any).mockResolvedValue({
      latitude: 0.5,
      longitude: 0.5,
    });

    // Mock de fetch para Nominatim
    fetchMock.mockResolvedValue({
      json: async () => [{ geojson: polygon }],
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

  it("muestra un loader mientras obtiene datos iniciales", async () => {
    const neighborhoodDeferred = createDeferred<any>();
    const fetchDeferred = createDeferred<any>();

    (neighborhoodService.getNeighborhoodById as any).mockReturnValueOnce(neighborhoodDeferred.promise);
    fetchMock.mockReturnValueOnce(fetchDeferred.promise);

    render(<AddressSelector {...defaultProps} />);

    expect(await screen.findByRole("progressbar")).toBeInTheDocument();

    neighborhoodDeferred.resolve({ latitude: 0.5, longitude: 0.5 });
    fetchDeferred.resolve({ json: async () => [{ geojson: polygon }] });

    await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
    expect(await screen.findByLabelText(/Calle/i)).toBeInTheDocument();
  });

  it("abre el mapa, deshabilita la calle y valida dentro del barrio", async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => [{ geojson: polygon }] });
    fetchMock.mockResolvedValueOnce({
      json: async () => [{ lat: "0.5", lon: "0.5" }],
    });

    const localOnChange = vi.fn();

    render(
      <AddressSelector
        {...defaultProps}
        value={{ street: "Belgrano", number: "123" }}
        onChange={localOnChange}
      />
    );

    const calle = await screen.findByLabelText(/Calle/i);
    expect(calle).not.toBeDisabled();

    const buttons = screen.getAllByRole("button");
    const mapButton = buttons[buttons.length - 1];
    fireEvent.click(mapButton);

    const calleFields = screen.getAllByLabelText(/Calle/i);
    expect(calleFields[0]).toBeDisabled();

    const successMessages = await screen.findAllByText("Dirección válida dentro del barrio.");
    expect(successMessages.length).toBeGreaterThan(0);

    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("Belgrano+123%2C+Centro")
    );
  });

  it("muestra mensaje de error cuando la dirección queda fuera del barrio", async () => {
    fetchMock.mockResolvedValueOnce({ json: async () => [{ geojson: polygon }] });
    fetchMock.mockResolvedValueOnce({ json: async () => [] });

    render(
      <AddressSelector
        {...defaultProps}
        value={{ street: "Falsa", number: "123" }}
      />
    );

    await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);

    const errorMessages = await screen.findAllByText("La dirección no está dentro del barrio.");
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it("permite setear número S/N desde el adornment", async () => {
    render(
      <AddressSelector
        {...defaultProps}
        value={{ street: "", number: "" }}
      />
    );

    const numero = await screen.findByLabelText(/Número/i);
    const container = numero.closest("div");
    const clearButton = container?.querySelector("button");
    fireEvent.click(clearButton as HTMLButtonElement);

    expect(defaultProps.onChange).toHaveBeenLastCalledWith({ street: "", number: "S/N" });
  });

});
