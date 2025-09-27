/// <reference types="vitest" />
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PropertyDetailsCompare } from "../../../components/propertyDetails/PropertyDetailsCompare";
import type { Property } from "../../../types/property";
import { NeighborhoodType } from "../../../types/neighborhood";

// Mock de subcomponentes
vi.mock("../../../components/propertyDetails/PropertyPanel", () => ({
  PropertyPanel: ({ property }: any) => (
    <div data-testid="property-panel">{property.title}</div>
  ),
}));
vi.mock("../../../components/propertyDetails/PropertyInfoCompare", () => ({
  default: () => <div data-testid="property-info-compare" />,
}));
vi.mock("../../../components/propertyDetails/maps/MapSection", () => ({
  MapSection: ({ address }: any) => <div data-testid="map-section">{address}</div>,
}));

describe("PropertyDetailsCompare", () => {
  const mockProperty = (id: number, title: string): Property => ({
    id,
    title,
    street: `Calle ${id}`,
    number: `${id}`,
    description: `Propiedad ${id}`,
    status: "Disponible",
    operation: "Venta",
    currency: "USD",
    rooms: 2,
    bathrooms: 1,
    bedrooms: 1,
    area: 50,
    coveredArea: 40,
    price: 100000,
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
      id: id,
      name: `Barrio ${id}`,
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
  });

it("muestra mensaje si hay menos de 2 propiedades", () => {
  render(<PropertyDetailsCompare comparisonItems={[mockProperty(1, "P1")]} />);

  // Verificamos el título
  expect(
    screen.getByText("No hay suficientes propiedades para comparar.")
  ).toBeInTheDocument();

  // Verificamos la descripción
  expect(
    screen.getByText(
      "Selecciona entre dos y tres propiedades del catálogo para ver la comparación."
    )
  ).toBeInTheDocument();
});

  it("renderiza correctamente 2 propiedades", () => {
    const items = [mockProperty(1, "P1"), mockProperty(2, "P2")];
    render(<PropertyDetailsCompare comparisonItems={items} />);

    const panels = screen.getAllByTestId("property-panel");
    const maps = screen.getAllByTestId("map-section");

    expect(panels).toHaveLength(2);
    expect(maps).toHaveLength(2);

    panels.forEach((panel, i) => {
      expect(panel).toHaveTextContent(items[i].title);
    });
    maps.forEach((map, i) => {
      expect(map).toHaveTextContent(
        `${items[i].street}, ${items[i].neighborhood.name}, ${items[i].neighborhood.city}`
      );
    });
  });

  it("renderiza correctamente 3 propiedades", () => {
    const items = [mockProperty(1, "P1"), mockProperty(2, "P2"), mockProperty(3, "P3")];
    render(<PropertyDetailsCompare comparisonItems={items} />);

    const panels = screen.getAllByTestId("property-panel");
    const maps = screen.getAllByTestId("map-section");

    expect(panels).toHaveLength(3);
    expect(maps).toHaveLength(3);

    panels.forEach((panel, i) => {
      expect(panel).toHaveTextContent(items[i].title);
    });
    maps.forEach((map, i) => {
      expect(map).toHaveTextContent(
        `${items[i].street}, ${items[i].neighborhood.name}, ${items[i].neighborhood.city}`
      );
    });
  });
});
