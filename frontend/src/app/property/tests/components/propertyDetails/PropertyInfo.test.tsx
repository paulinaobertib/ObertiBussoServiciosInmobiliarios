/// <reference types="vitest" />
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import type { Property } from "../../../types/property";

const mockPutPropertyOutstanding = vi.fn(() => Promise.resolve());

// mockeamos antes del import
vi.mock("../../../../user/context/AuthContext", () => ({
  useAuthContext: vi.fn(() => ({ isAdmin: true })),
}));

vi.mock("../../../services/property.service", () => ({
  putPropertyOutstanding: (...args: Parameters<typeof mockPutPropertyOutstanding>) =>
    mockPutPropertyOutstanding(...args),
}));

vi.mock("../../../components/categories/CategoryModal", () => ({
  ModalItem: ({ info }: any) => <div data-testid="modal-item">{info.title}</div>,
  Info: () => null,
}));

import { PropertyInfo } from "../../../components/propertyDetails/PropertyInfo";
import { useAuthContext } from "../../../../user/context/AuthContext";

describe("PropertyInfo", () => {
  const baseProperty: Property = {
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

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("muestra features y amenities", () => {
    render(<PropertyInfo property={baseProperty} />);
    expect(screen.getByText(/2 dormitorios/)).toBeInTheDocument();
    expect(screen.getByText(/2 baños/)).toBeInTheDocument();
    expect(screen.getByText(/3 ambientes/)).toBeInTheDocument();
    expect(screen.getByText(/80 m²/)).toBeInTheDocument();
    expect(screen.getByText("Gimnasio")).toBeInTheDocument();
  });

  it("muestra título, ubicación y precio", () => {
    render(<PropertyInfo property={baseProperty} />);
    expect(screen.getByText(baseProperty.title)).toBeInTheDocument();
    expect(screen.getByText(/Calle Falsa 123/)).toBeInTheDocument();
    expect(screen.getByText(/Palermo/)).toBeInTheDocument();
    expect(screen.getByText(/Buenos Aires/)).toBeInTheDocument();
    expect(screen.getByText(/\$ ?120[.,]000/)).toBeInTheDocument();

    const expensasEl = screen.getByText(
      (content) => /Expensas/.test(content) && /2[.,]000/.test(content)
    );
    expect(expensasEl).toBeInTheDocument();
  });

  it("no muestra la descripción (se renderiza en otro componente)", () => {
    render(<PropertyInfo property={baseProperty} />);
    expect(screen.queryByText(/Hermoso departamento/)).not.toBeInTheDocument();
  });

  it("muestra 'Consultar precio' cuando showPrice es false", () => {
    const prop = { ...baseProperty, showPrice: false };
    render(<PropertyInfo property={prop} />);
    expect(screen.getByText(/Consultar precio/)).toBeInTheDocument();
    expect(screen.queryByText(/Expensas/)).not.toBeInTheDocument();
  });

  it("muestra 'Ubicación desconocida' si no hay neighborhood ni street", () => {
    const prop = { ...baseProperty, street: "", neighborhood: undefined as any };
    render(<PropertyInfo property={prop} />);
    expect(screen.getByText(/Ubicación desconocida/)).toBeInTheDocument();
  });

  it("no muestra especificaciones ni características si no hay features ni amenities", () => {
    const prop = {
      ...baseProperty,
      bedrooms: 0,
      bathrooms: 0,
      rooms: 0,
      area: null as any,
      coveredArea: null as any,
      amenities: [],
    };
    render(<PropertyInfo property={prop} />);
    expect(screen.queryByText(/Especificaciones/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Características/)).not.toBeInTheDocument();
  });

  it("abre el modal al hacer click en editar estado", () => {
    render(<PropertyInfo property={baseProperty} />);
    const editBtn = screen.getByRole("button", { name: /editar estado/i });
    fireEvent.click(editBtn);
    expect(screen.getByTestId("modal-item")).toHaveTextContent("Editar estado");
  });

  it("no renderiza controles de admin si isAdmin = false", () => {
    (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: false });
    render(<PropertyInfo property={baseProperty} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("muestra 'Consultar precio' si showPrice es false", () => {
    const prop = { ...baseProperty, showPrice: false };
    render(<PropertyInfo property={prop} />);
    expect(screen.getByText(/Consultar precio/i)).toBeInTheDocument();
    expect(screen.queryByText(/Expensas/)).not.toBeInTheDocument();
  });

  it("muestra 'Ubicación desconocida' si no hay street ni neighborhood", () => {
    const prop = { ...baseProperty, street: "", neighborhood: undefined as any };
    render(<PropertyInfo property={prop} />);
    expect(screen.getByText(/Ubicación desconocida/i)).toBeInTheDocument();
  });

  it("no renderiza descripción aunque esté vacía (control en otro componente)", () => {
    const prop = { ...baseProperty, description: "" };
    render(<PropertyInfo property={prop} />);
    expect(screen.queryByText(/Descripción/i)).not.toBeInTheDocument();
  });

  it("no muestra controles de admin si isAdmin=false", () => {
    (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: false });
    render(<PropertyInfo property={baseProperty} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

});
