import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Comparer } from "../../../components/comparer/Comparer";
import { vi } from "vitest";
import * as useComparerModule from "../../../hooks/useComparer";
import { PropertyDTOAI } from "../../../types/property"; 

describe("Comparer", () => {
  const mockCompare = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useComparerModule, "useComparerProperty").mockReturnValue({
      compare: mockCompare,
      loading: false,
      result: null,
      error: null,
    });
  });

  const mockData: PropertyDTOAI[] = [
    {
      name: "P1",
      address: "Calle 1",
      latitude: 0,
      longitude: 0,
      rooms: 1,
      bathrooms: 1,
      bedrooms: 1,
      area: 50,
      coveredArea: 40,
      price: 100,
      operation: "Venta",
      type: "Casa",
      amenities: new Set<string>(),
    },
    {
      name: "P2",
      address: "Calle 2",
      latitude: 0,
      longitude: 0,
      rooms: 2,
      bathrooms: 1,
      bedrooms: 1,
      area: 60,
      coveredArea: 50,
      price: 150,
      operation: "Venta",
      type: "Departamento",
      amenities: new Set<string>(),
    },
  ];

  it("renderiza el componente cerrado y abre al hacer click en el avatar", () => {
    render(<Comparer data={[]} />);

    const avatar = screen.getByRole("img", { name: /house/i });
    expect(avatar).toBeInTheDocument();

    fireEvent.click(avatar);
    fireEvent.click(avatar); // toggle
  });

  it("muestra mensaje de loading cuando loading = true", () => {
    vi.spyOn(useComparerModule, "useComparerProperty").mockReturnValue({
      compare: mockCompare,
      loading: true,
      result: null,
      error: null,
    });

    render(<Comparer data={mockData} />);
    expect(screen.getByText(/Estoy analizando las propiedades/i)).toBeInTheDocument();
  });

  it("muestra mensaje de error cuando error existe", () => {
    vi.spyOn(useComparerModule, "useComparerProperty").mockReturnValue({
      compare: mockCompare,
      loading: false,
      result: null,
      error: "Error comparando",
    });

    render(<Comparer data={mockData} />);
    expect(screen.getByText(/Error comparando/i)).toBeInTheDocument();
  });

  it("muestra resultado cuando result existe", () => {
    vi.spyOn(useComparerModule, "useComparerProperty").mockReturnValue({
      compare: mockCompare,
      loading: false,
      result: "Propiedad A es mejor",
      error: null,
    });

    render(<Comparer data={mockData} />);
    expect(screen.getByText(/Propiedad A es mejor/i)).toBeInTheDocument();
  });

  it("llama a compare automáticamente si data tiene 2 o 3 elementos", async () => {
    render(<Comparer data={mockData} />);
    await waitFor(() => {
      expect(mockCompare).toHaveBeenCalledWith(mockData);
    });
  });
});
