/// <reference types="vitest" />
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { Property } from "../../../types/property";
import { PropertyCrudProvider } from "../../../context/PropertiesContext";
import PropertyInfoCompare from "../../../components/propertyDetails/PropertyInfoCompare";

vi.mock("../../../utils/formatPrice", () => ({
  formatPrice: (value: number, currency: string) =>
    currency === "ARS" ? `$${value.toLocaleString("es-AR")}` : `$${value.toLocaleString("en-US")}`,
}));

vi.mock("../../../utils/propertyLocation", () => ({
  formatPropertyAddress: (property: any) => {
    if (!property.street && !property.neighborhood) return "";
    if (!property.neighborhood) return `${property.street}, ${property.number}, Córdoba, Argentina`;
    return `${property.street}, ${property.number}, ${property.neighborhood.name}, ${property.neighborhood.city}, Córdoba, Argentina`;
  },
}));

describe("PropertyInfoCompare", () => {
  const mockProperty: Property = {
    id: 1,
    title: "Departamento Test",
    street: "Calle Falsa 123",
    number: "123",
    description: "Hermoso departamento",
    status: "Disponible",
    operation: "Venta",
    currency: "USD",
    rooms: 3,
    bathrooms: 2,
    bedrooms: 2,
    area: 80,
    coveredArea: 70,
    price: 120000,
    expenses: 2000,
    showPrice: true,
    credit: false,
    financing: false,
    outstanding: false,
    owner: { id: 1, firstName: "Juan", lastName: "Perez", email: "juan@example.com", phone: "123456789" },
    neighborhood: { id: 1, name: "Palermo", city: "Buenos Aires", type: "" as any },
    type: { id: 1, name: "Departamento", hasBedrooms: true, hasBathrooms: true, hasRooms: true, hasCoveredArea: true },
    amenities: [{ id: 2, name: "Gimnasio" }],
    mainImage: "main.jpg",
    images: [],
    date: new Date().toISOString(),
  };

  const renderWithProvider = (ui: React.ReactNode) => render(<PropertyCrudProvider>{ui}</PropertyCrudProvider>);

  it("muestra título, ubicación y precio con expensas", () => {
    renderWithProvider(<PropertyInfoCompare property={mockProperty} />);
    expect(screen.getByText(mockProperty.title)).toBeInTheDocument();
    expect(screen.getByText(/Calle Falsa 123/i)).toBeInTheDocument();
    expect(screen.getByText(/Palermo/i)).toBeInTheDocument();
    expect(screen.getByText(/Buenos Aires/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ ?120[.,]000/)).toBeInTheDocument();
    const expensasNodes = screen.getAllByText(/Expensas/i);
    expect(expensasNodes[0]).toHaveTextContent(/2[.,\s]?000/);
  });

  it("muestra 'Consultar precio' si showPrice=false y sin expensas", () => {
    const prop = { ...mockProperty, showPrice: false, expenses: 0 };
    renderWithProvider(<PropertyInfoCompare property={prop} />);
    expect(screen.getByText(/Consultar precio/)).toBeInTheDocument();
    expect(screen.queryByText(/Expensas/)).not.toBeInTheDocument();
  });

  it("muestra 'Ubicación desconocida' si no hay neighborhood ni street", () => {
    const prop = { ...mockProperty, street: "", neighborhood: undefined as any };
    renderWithProvider(<PropertyInfoCompare property={prop} />);
    expect(screen.getByText(/Ubicación desconocida/)).toBeInTheDocument();
  });

  it("muestra correctamente features cuando se comparan propiedades", () => {
    renderWithProvider(<PropertyInfoCompare property={mockProperty} />);
    expect(screen.getByText(/2 dormitorios/)).toBeInTheDocument();
  });

  it("muestra amenities correctamente", () => {
    const prop = {
      ...mockProperty,
      amenities: [
        { id: 1, name: "Pileta" },
        { id: 3, name: "Gimnasio" },
      ],
    };
    renderWithProvider(<PropertyInfoCompare property={prop} />);
    expect(screen.getByText(/Pileta/i)).toBeInTheDocument();
    expect(screen.getByText(/Gimnasio/i)).toBeInTheDocument();
  });

  it("muestra '-' cuando feature es 0 o null", () => {
    const prop = { ...mockProperty, bedrooms: 0, bathrooms: 0, rooms: 0, area: 0, coveredArea: 0 };
    renderWithProvider(<PropertyInfoCompare property={prop} />);
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
    expect(screen.getByText("- m²")).toBeInTheDocument();
    expect(screen.getByText("- m² cubiertos")).toBeInTheDocument();
  });

  it("muestra 'Ubicación desconocida' si no hay street ni neighborhood (otra vez)", () => {
    const prop = { ...mockProperty, street: "", neighborhood: undefined as any };
    renderWithProvider(<PropertyInfoCompare property={prop} />);
    expect(screen.getByText(/Ubicación desconocida/i)).toBeInTheDocument();
  });

  it("muestra 'Consultar precio' si showPrice=false", () => {
    const prop = { ...mockProperty, showPrice: false };
    renderWithProvider(<PropertyInfoCompare property={prop} />);
    expect(screen.getByText(/Consultar precio/i)).toBeInTheDocument();
  });
});
