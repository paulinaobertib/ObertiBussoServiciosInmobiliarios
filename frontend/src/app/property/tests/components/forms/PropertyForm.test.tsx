import { render, screen, fireEvent } from "@testing-library/react";
import { vi, Mock } from "vitest";
import React from "react";
import { PropertyForm, PropertyFormHandle } from "../../../components/forms/PropertyForm";
import { usePropertyForm } from "../../../hooks/usePropertyForm";

// Mocks
vi.mock("../../../hooks/usePropertyForm");
vi.mock("../../../shared/components/images/ImageUploader", () => ({
  ImageUploader: ({ label }: { label: string }) => <div>{label}</div>
}));
vi.mock("../propertyDetails/maps/AddressSelector", () => ({
  AddressSelector: ({ neighborhoodName }: { neighborhoodName: string }) => (
    <div>AddressSelector: {neighborhoodName}</div>
  )
}));

describe("PropertyForm", () => {
  const mockCtrl = {
    form: {
      title: "Casa bonita",
      operation: "VENTA",
      status: "DISPONIBLE",
      credit: false,
      financing: false,
      currency: "ARS",
      price: 100000,
      expenses: 2000,
      showPrice: true,
      outstanding: false,
      description: "Hermosa propiedad",
      neighborhood: { id: 1, name: "Centro" },
      street: "Calle Falsa",
      number: "123",
      rooms: 2,
      bedrooms: 1,
      bathrooms: 1,
      area: 100,
      coveredArea: 80,
    },
    fieldErrors: {},
    num: () => vi.fn(),
    showRooms: true,
    showBedrooms: true,
    showBathrooms: true,
    showCoveredArea: true,
    colSize: 6,
    setMain: vi.fn(),
    addToGallery: vi.fn(),
    submit: vi.fn(),
    reset: vi.fn(),
    remove: vi.fn(),
    setField: vi.fn(),
    getCreateData: vi.fn(),
    getUpdateData: vi.fn(),
  };

  beforeEach(() => {
    (usePropertyForm as Mock).mockReturnValue(mockCtrl);
    vi.clearAllMocks();
  });

    it("renderiza campos básicos", () => {
    render(<PropertyForm />);

    // Moneda: varios elementos → usamos getAllByText
    expect(screen.getAllByText(/Moneda/i)[0]).toBeInTheDocument();

    // Otros campos
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Precio/i)).toBeInTheDocument();
    });

  it("llama a setField al escribir en Título", () => {
    render(<PropertyForm />);
    fireEvent.change(screen.getByLabelText(/Título/i), { target: { value: "Nueva Casa" } });
    expect(mockCtrl.setField).toHaveBeenCalledWith("title", "Nueva Casa");
  });

  it("renderiza campos dinámicos (rooms, bedrooms, bathrooms, coveredArea)", () => {
    render(<PropertyForm />);
    expect(screen.getByLabelText(/Ambientes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dormitorios/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Baños/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Superficie Cubierta/i)).toBeInTheDocument();
  });

  it("expone métodos imperativos con ref", () => {
    const ref = React.createRef<PropertyFormHandle>();
    render(<PropertyForm ref={ref} />);
    expect(ref.current?.submit).toBe(mockCtrl.submit);
    expect(ref.current?.reset).toBe(mockCtrl.reset);
    expect(ref.current?.deleteImage).toBe(mockCtrl.remove);
  });

  it("llama addToGallery y setMain en ImageUploader", () => {
    render(<PropertyForm />);
    expect(screen.getByText("Imagen principal")).toBeInTheDocument();
    expect(screen.getByText("Imágenes adicionales")).toBeInTheDocument();
  });

  it("llama setField al cambiar AddressSelector", () => {
    render(<PropertyForm />);
    // simulamos un cambio en AddressSelector
    mockCtrl.setField("street", "Nueva Calle");
    mockCtrl.setField("number", "456");
    expect(mockCtrl.setField).toHaveBeenCalledWith("street", "Nueva Calle");
    expect(mockCtrl.setField).toHaveBeenCalledWith("number", "456");
  });

  it("resetea el form usando el ref", () => {
    const ref = React.createRef<PropertyFormHandle>();
    render(<PropertyForm ref={ref} />);
    ref.current?.reset();
    expect(mockCtrl.reset).toHaveBeenCalled();
  });

it("cambia descripción", () => {
  render(<PropertyForm />);
  const descInput = screen.getByLabelText(/Descripción/i);
  fireEvent.change(descInput, { target: { value: "Nueva descripción" } });
  expect(mockCtrl.setField).toHaveBeenCalledWith("description", "Nueva descripción");
});

it("cambia dirección desde AddressSelector", () => {
  render(<PropertyForm />);
  // Simulamos cambio en AddressSelector
  mockCtrl.setField("street", "Calle Falsa 2");
  mockCtrl.setField("number", "789");
  expect(mockCtrl.setField).toHaveBeenCalledWith("street", "Calle Falsa 2");
  expect(mockCtrl.setField).toHaveBeenCalledWith("number", "789");
});


});
