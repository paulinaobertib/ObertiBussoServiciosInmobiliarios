/// <reference types="vitest" />
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { Property } from "../../../types/property";

vi.mock("../../../user/context/AuthContext", () => ({
  useAuthContext: () => ({ isAdmin: true }),
}));

vi.mock("../../../services/property.service", () => ({
  putPropertyOutstanding: vi.fn(() => Promise.resolve()),
}));

vi.mock("../../../components/categories/CategoryModal", () => ({
  ModalItem: ({ info }: any) => <div data-testid="modal-item">{info.title}</div>,
  Info: () => null,
}));

import { PropertyInfo } from "../../../components/propertyDetails/PropertyInfo";

describe("PropertyInfo", () => {
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

  it("muestra features y amenities", () => {
    render(<PropertyInfo property={mockProperty} />);
    expect(screen.getByText((t) => t.includes("2 dormitorios"))).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("2 baños"))).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("3 ambientes"))).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("80 m²"))).toBeInTheDocument();
    expect(screen.getByText("Gimnasio")).toBeInTheDocument();
  });

  it("muestra título, ubicación y precio", () => {
    render(<PropertyInfo property={mockProperty} />);
    expect(screen.getByText(mockProperty.title)).toBeInTheDocument();
    expect(screen.getByText(/Calle Falsa 123/i)).toBeInTheDocument();
    expect(screen.getByText(/Palermo/i)).toBeInTheDocument();
    expect(screen.getByText(/Buenos Aires/i)).toBeInTheDocument();
    expect(screen.getByText(/\$ ?120[.,]000/)).toBeInTheDocument();

    const expensasEl = screen.getByText((content) => {
      const hasLabel = /Expensas/i.test(content);
      const hasAmount = /\b2[.,]000(,[0-9]{2}|\.[0-9]{2})?\b/.test(content);
      return hasLabel && hasAmount;
    });
    expect(expensasEl).toBeInTheDocument();
  });

  it("muestra descripción", () => {
    render(<PropertyInfo property={mockProperty} />);
    expect(screen.getByText(/Hermoso departamento/i)).toBeInTheDocument();
  });
});
