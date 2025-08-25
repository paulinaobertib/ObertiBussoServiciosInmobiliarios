/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { AppointmentDetailsDialog } from "../../../../components/appointments/admin/AppointmentDetails";

vi.mock("@mui/icons-material", () => {
  const React = require("react");
  const mk = (name: string) =>
    (props: any) => React.createElement("i", { "data-testid": name, ...props });
  return {
    AccessTime: mk("AccessTime"),
    Person: mk("Person"),
    EmailOutlined: mk("EmailOutlined"),
    PhoneOutlined: mk("PhoneOutlined"),
    ChatBubbleOutline: mk("ChatBubbleOutline"),
  };
});

vi.mock("@mui/lab", () => ({
  LoadingButton: ({ loading, children, ...rest }: any) => (
    <button disabled={!!loading} {...rest}>{children}</button>
  ),
}));

vi.mock("../../../../hooks/useAppointments", () => ({
  useAppointments: vi.fn(),
}));
import { useAppointments } from "../../../../hooks/useAppointments";

vi.mock("../../../../services/user.service", () => ({
  getUserById: vi.fn(),
}));
import { getUserById } from "../../../../services/user.service";

// Mock Modal simple
vi.mock("../../../../shared/components/Modal", () => ({
  Modal: ({ open, title, onClose, children }: any) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose}>x</button>
        {children}
      </div>
    ) : null,
}));

describe("AppointmentDetailsDialog", () => {
  const reloadAdmin = vi.fn();

  const baseSlot = {
    id: 1,
    date: "2025-06-12T14:30:00", // sin Z para evitar desfases de zona
    availability: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAppointments as unknown as Mock).mockReturnValue({
      slotMap: { 1: baseSlot },
      apptsBySlot: {},
      reloadAdmin,
    });

    (getUserById as unknown as Mock).mockResolvedValue({
      data: {
        id: 42,
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
        phone: "12345",
      },
    });
  });

  const renderDlg = (props?: Partial<React.ComponentProps<typeof AppointmentDetailsDialog>>) => {
    const onClose = vi.fn();
    const onAccept = vi.fn().mockResolvedValue({});
    const onReject = vi.fn().mockResolvedValue({});
    const onDelete = vi.fn().mockResolvedValue({});

    render(
      <AppointmentDetailsDialog
        open={true}
        slotId={1}
        onClose={onClose}
        onAccept={onAccept}
        onReject={onReject}
        onDelete={onDelete}
        {...props}
      />
    );

    return { onClose, onAccept, onReject, onDelete };
  };

  it("retorna null si no existe el slot", () => {
    (useAppointments as unknown as Mock).mockReturnValueOnce({
      slotMap: {},
      apptsBySlot: {},
      reloadAdmin,
    });

    const { container } = render(
      <AppointmentDetailsDialog
        open={true}
        slotId={999}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("llama reloadAdmin cuando se abre", () => {
    renderDlg();
    expect(reloadAdmin).toHaveBeenCalled();
  });

  it("muestra hora/fecha y chip 'Disponible' para slot disponible", () => {
    renderDlg();

    // Hora
    expect(screen.getByText("14:30")).toBeInTheDocument();
    // Fecha (es) — validamos parte estable
    expect(
      screen.getByText((t) => /12 de junio 2025/i.test(t))
    ).toBeInTheDocument();

    // Chip
    expect(screen.getByText("Disponible")).toBeInTheDocument();

    // Solo botón Eliminar visible
    expect(screen.getByRole("button", { name: /Eliminar/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Confirmar/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Rechazar/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Cancelar/i })).toBeNull();
  });

  it("slot disponible: Eliminar → onDelete(slot.id), recarga y cierra", async () => {
    const { onDelete, onClose } = renderDlg();

    fireEvent.click(screen.getByRole("button", { name: /Eliminar/i }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(1);
      expect(reloadAdmin).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

});
