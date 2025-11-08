/// <reference types="vitest" />
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PropertyDetails } from "../../../components/propertyDetails/PropertyDetails";
import type { Property } from "../../../types/property";
import { NeighborhoodType } from "../../../types/neighborhood";

// Mock de subcomponentes
vi.mock("../../../components/propertyDetails/PropertyPanel", () => ({
  PropertyPanel: ({ property }: any) => <div data-testid="property-panel">{property.title}</div>,
}));
vi.mock("../../../components/propertyDetails/PropertyInfo", () => ({
  PropertyInfo: () => <div data-testid="property-info" />,
}));
vi.mock("../../../components/propertyDetails/maps/MapSection", () => ({
  MapSection: ({ address }: any) => <div data-testid="map-section">{address}</div>,
}));

describe("PropertyDetails", () => {
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
    expenses: null,
    showPrice: true,
    credit: false,
    financing: false,
    outstanding: false,
    owner: {
      id: 1,
      firstName: "Juan",
      lastName: "Perez",
      email: "juan@example.com",
      phone: "123456789",
    },
    neighborhood: {
      id: 1,
      name: "Palermo",
      city: "Buenos Aires",
      type: NeighborhoodType.ABIERTO,
    },
    type: {
      id: 1,
      name: "Departamento",
      hasBedrooms: true,
      hasBathrooms: true,
      hasRooms: true,
      hasCoveredArea: true,
    },
    amenities: [],
    mainImage: "main.jpg",
    images: [],
    date: new Date().toISOString(),
  };

  it("renderiza PropertyPanel y MapSection", () => {
    render(<PropertyDetails property={mockProperty} />);

    expect(screen.getByTestId("property-panel")).toHaveTextContent(mockProperty.title);
    expect(screen.getByTestId("map-section")).toHaveTextContent(
      `${mockProperty.street}, ${mockProperty.neighborhood.name}, ${mockProperty.neighborhood.city}`
    );
  });

  it("usa dirección por defecto si no hay barrio", () => {
    const propertyNoNeighborhood = {
      ...mockProperty,
      neighborhood: undefined,
    } as unknown as Property;

    render(<PropertyDetails property={propertyNoNeighborhood} />);
    expect(screen.getByTestId("map-section")).toHaveTextContent(`${mockProperty.street}, Buenos Aires, Argentina`);
  });
});
