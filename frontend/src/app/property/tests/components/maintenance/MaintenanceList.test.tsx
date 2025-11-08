/// <reference types="vitest" />
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MaintenanceList, Props } from "../../../components/maintenances/MaintenanceList";

vi.mock("../../../components/maintenances/MaintenanceItem", () => ({
  MaintenanceItem: ({ maintenance, onEdit, onDelete }: any) => (
    <div>
      <span>{maintenance.title}</span>
      <button onClick={onEdit}>Editar</button>
      <button onClick={onDelete}>Eliminar</button>
    </div>
  ),
}));

describe("MaintenanceList", () => {
  const mockOnEditItem = vi.fn();
  const mockOnDeleteItem = vi.fn();

  const items: Props["items"] = [
    {
      id: 1,
      title: "Filtro",
      description: "Cambio de filtro",
      date: new Date("2025-08-25").toISOString(),
      propertyId: 1,
    },
    {
      id: 2,
      title: "Aceite",
      description: "Cambio de aceite",
      date: new Date("2025-08-27").toISOString(),
      propertyId: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza todos los items", () => {
    render(<MaintenanceList items={items} onEditItem={mockOnEditItem} onDeleteItem={mockOnDeleteItem} />);
    expect(screen.getByText("Filtro")).toBeInTheDocument();
    expect(screen.getByText("Aceite")).toBeInTheDocument();
  });

  it("ordena los items por fecha descendente", () => {
    render(<MaintenanceList items={items} onEditItem={mockOnEditItem} onDeleteItem={mockOnDeleteItem} />);
    const titles = screen.getAllByText(/Filtro|Aceite/).map((el) => el.textContent);
    expect(titles).toEqual(["Aceite", "Filtro"]); // Aceite es más reciente
  });

  it("llama onEditItem al hacer click en editar", () => {
    render(<MaintenanceList items={items} onEditItem={mockOnEditItem} onDeleteItem={mockOnDeleteItem} />);
    const editButtons = screen.getAllByText("Editar");
    fireEvent.click(editButtons[0]);
    expect(mockOnEditItem).toHaveBeenCalledWith(items[1]); // primer botón corresponde al más reciente
  });

  it("llama onDeleteItem al hacer click en eliminar", () => {
    render(<MaintenanceList items={items} onEditItem={mockOnEditItem} onDeleteItem={mockOnDeleteItem} />);
    const deleteButtons = screen.getAllByText("Eliminar");
    fireEvent.click(deleteButtons[1]);
    expect(mockOnDeleteItem).toHaveBeenCalledWith(items[0]); // segundo botón corresponde al más viejo
  });
});
