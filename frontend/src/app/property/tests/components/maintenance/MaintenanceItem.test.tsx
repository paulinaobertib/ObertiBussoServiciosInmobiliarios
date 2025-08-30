/// <reference types="vitest" />
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MaintenanceItem, Props } from "../../../components/maintenances/MaintenanceItem";

describe("MaintenanceItem", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const baseProps: Props = {
    maintenance: {
      id: 1,
      title: "Cambio de filtro",
      description: "Se realizó el cambio del filtro de aire.",
      date: new Date().toISOString(),
      propertyId: 123,
    },
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /*it("renderiza título, descripción y fecha/hora", () => {
    render(<MaintenanceItem {...baseProps} />);
    expect(screen.getByText(baseProps.maintenance.title)).toBeInTheDocument();
    expect(screen.getByText(baseProps.maintenance.description)).toBeInTheDocument();

    const date = new Date(baseProps.maintenance.date);
    const day = date.getDate();
    const month = date.toLocaleString(undefined, { month: "short" });
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Matcher más flexible
    expect(screen.getByText((content) => {
      return content.includes(`${day}`) && content.includes(`${month}`) && content.includes(`${year}`) && content.includes(`${hour}`) && content.includes(`${minute}`);
    })).toBeInTheDocument();
  });*/

  it("muestra el chip 'Nuevo' si la fecha es dentro de 3 días", () => {
    render(<MaintenanceItem {...baseProps} />);
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
  });

  it("no muestra el chip 'Nuevo' si la fecha es anterior a 3 días", () => {
    const oldDateProps = {
      ...baseProps,
      maintenance: {
        ...baseProps.maintenance,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
    render(<MaintenanceItem {...oldDateProps} />);
    expect(screen.queryByText("Nuevo")).not.toBeInTheDocument();
  });

  it("llama onEdit al hacer click en el botón de editar", () => {
    render(<MaintenanceItem {...baseProps} />);
    const editButton = screen.getByRole("button", { name: /Editar/i });
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it("llama onDelete al hacer click en el botón de eliminar", () => {
    render(<MaintenanceItem {...baseProps} />);
    const deleteButton = screen.getByRole("button", { name: /Eliminar/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalled();
  });
});
