/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MaintenanceSection } from "../../../components/maintenances/MaintenanceSection";
import type { Maintenance } from "../../../types/maintenance";

const useAuthContextMock = vi.fn(() => ({ isAdmin: false }));
vi.mock("../../../../user/context/AuthContext", () => ({
  useAuthContext: () => useAuthContextMock(),
}));

// Mock de componentes internos
vi.mock("../../../components/forms/MaintenanceForm", () => ({
  MaintenanceForm: ({ action, onDone }: any) => (
    <div>
      <span>MaintenanceForm {action}</span>
      <button onClick={onDone}>Done</button>
    </div>
  ),
}));

vi.mock("../../../components/maintenances/MaintenanceList", () => ({
  MaintenanceList: ({ items, onEditItem, onDeleteItem }: any) => (
    <div>
      {items.map((m: any) => (
        <div key={m.id}>
          <span>{m.title}</span>
          <button onClick={() => onEditItem(m)}>Editar</button>
          <button onClick={() => onDeleteItem(m)}>Eliminar</button>
        </div>
      ))}
    </div>
  ),
}));

// Mock del servicio deleteMaintenance
vi.mock("../../../services/maintenance.service", () => ({
  deleteMaintenance: vi.fn().mockResolvedValue(undefined),
}));

import { deleteMaintenance } from "../../../services/maintenance.service";

describe("MaintenanceSection", () => {
  const mockRefresh = vi.fn().mockResolvedValue(undefined);

  const items: Maintenance[] = [
    { id: 1, title: "Filtro", description: "Cambio de filtro", date: new Date().toISOString(), propertyId: 1 },
    { id: 2, title: "Aceite", description: "Cambio de aceite", date: new Date().toISOString(), propertyId: 1 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthContextMock.mockReturnValue({ isAdmin: false });
  });

  it("renderiza título 'Agregar Mantenimiento' por defecto", () => {
    render(<MaintenanceSection propertyId={1} loading={false} items={[]} refresh={mockRefresh} />);
    expect(screen.getByText("Agregar Mantenimiento")).toBeInTheDocument();
  });

  it("renderiza MaintenanceForm con los props correctos", () => {
    render(<MaintenanceSection propertyId={1} loading={false} items={items} refresh={mockRefresh} />);
    expect(screen.getByText("MaintenanceForm add")).toBeInTheDocument();
  });

  it("muestra el loader cuando loading es true", () => {
    render(<MaintenanceSection propertyId={1} loading={true} items={[]} refresh={mockRefresh} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sin mantenimientos muestra EmptyState genérico", () => {
    render(<MaintenanceSection propertyId={1} loading={false} items={[]} refresh={mockRefresh} />);
    expect(screen.getByText(/No hay mantenimientos disponibles/i)).toBeInTheDocument();
  });

  it("para admin muestra mensaje personalizado en estado vacío", () => {
    useAuthContextMock.mockReturnValue({ isAdmin: true });
    render(<MaintenanceSection propertyId={1} loading={false} items={[]} refresh={mockRefresh} />);
    expect(screen.getByText(/No hay mantenimientos registrados/i)).toBeInTheDocument();
  });

  it("llama startEdit al hacer click en editar de MaintenanceList", () => {
    render(<MaintenanceSection propertyId={1} loading={false} items={items} refresh={mockRefresh} />);
    const editButtons = screen.getAllByText("Editar");
    fireEvent.click(editButtons[0]);
    expect(screen.getByText("Editar Mantenimiento")).toBeInTheDocument();
  });

  it("llama handleDelete y refresh al hacer click en eliminar", async () => {
    render(<MaintenanceSection propertyId={1} loading={false} items={items} refresh={mockRefresh} />);
    const deleteButtons = screen.getAllByText("Eliminar");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => expect(deleteMaintenance).toHaveBeenCalledWith(items[0]));
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
  });

  it("llama onDone y vuelve a 'add' al hacer click en el botón Done de MaintenanceForm", () => {
    render(<MaintenanceSection propertyId={1} loading={false} items={items} refresh={mockRefresh} />);
    const doneButton = screen.getByText("Done");
    fireEvent.click(doneButton);
    expect(screen.getByText("Agregar Mantenimiento")).toBeInTheDocument();
  });
});
