/// <reference types="vitest" />
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { Property } from "../../../types/property";
import { PropertyCrudProvider } from "../../../context/PropertiesContext"; // importa tu provider real
import PropertyInfoCompare from "../../../components/propertyDetails/PropertyInfoCompare";

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

  const renderWithProvider = (ui: React.ReactNode) =>
    render(<PropertyCrudProvider>{ui}</PropertyCrudProvider>);

  it("muestra título, ubicación y precio", () => {
    renderWithProvider(<PropertyInfoCompare property={mockProperty} />);
    expect(screen.getByText(mockProperty.title)).toBeInTheDocument();
    expect(screen.getByText(/Calle Falsa 123/i)).toBeInTheDocument();
    expect(screen.getByText(/Palermo/i)).toBeInTheDocument();
    expect(screen.getByText(/Buenos Aires/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ ?120[.,]000/)).toBeInTheDocument();
    const expensasEl = screen.getByText(/Expensas/i);
    expect(expensasEl).toHaveTextContent(/2[.,\s]?000/);
  });

  it("muestra features y amenities", () => {
    renderWithProvider(<PropertyInfoCompare property={mockProperty} />);
    expect(screen.getByText(/2 dormitorios/)).toBeInTheDocument();
    expect(screen.getByText(/2 baños/)).toBeInTheDocument();
    expect(screen.getByText(/3 ambientes/)).toBeInTheDocument();
    expect(screen.getByText(/80 m²/)).toBeInTheDocument();
    expect(screen.getByText(/70 m² cubiertos/)).toBeInTheDocument();
    expect(screen.getByText("Gimnasio")).toBeInTheDocument();
  });

  it("muestra descripción", () => {
    renderWithProvider(<PropertyInfoCompare property={mockProperty} />);
    expect(screen.getByText(/Hermoso departamento/)).toBeInTheDocument();
  });
});
