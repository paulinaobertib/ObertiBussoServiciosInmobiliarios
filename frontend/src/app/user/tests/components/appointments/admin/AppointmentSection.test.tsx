/// <reference types="vitest" />
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";

vi.mock("../../../../services/user.service", () => ({
  getUserById: vi.fn(),
}));

import { AppointmentItem } from "../../../../components/appointments/admin/AppointmentItem";
import { getUserById } from "../../../../services/user.service";

const getUserByIdMock = getUserById as unknown as Mock;

const theme = createTheme();
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

function makeSlot(id: number, date: string, availability: boolean) {
  return { id, date, availability };
}

function makeAppt(slotId: number, status: "ESPERA" | "ACEPTADO" | "RECHAZADO", userId?: number) {
  return { id: slotId * 100, slotId, status, userId };
}

describe("<AppointmentItem />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra hora y fecha formateadas y estado 'Disponible' + 'Libre' cuando no hay appt", () => {
    const date = "2025-01-02T15:45:00.000Z"; // usamos dayjs en prueba para comparar igual que el componente
    const slot = makeSlot(1, date, true);
    const onClick = vi.fn();

    const { container } = renderWithTheme(<AppointmentItem slot={slot as any} onClick={onClick} />);

    // hora y fecha
    expect(screen.getByText(dayjs(date).format("HH:mm"))).toBeInTheDocument();
    expect(screen.getByText(dayjs(date).format("DD/MM"))).toBeInTheDocument();

    // estado + libre
    expect(screen.getByText("Disponible")).toBeInTheDocument();
    expect(screen.getByText("Libre")).toBeInTheDocument();

    // click sobre el paper (primer nodo)
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClick).toHaveBeenCalledWith(slot.id);
  });

  it("estado 'Pendiente' y carga de usuario: muestra 'Cargando…' y luego el nombre al resolver getUserById", async () => {
    const date = "2025-03-10T10:00:00.000Z";
    const slot = makeSlot(2, date, false);
    const appt = makeAppt(2, "ESPERA", 99);

    getUserByIdMock.mockResolvedValueOnce({
      data: { firstName: "Ana", lastName: "García", email: "ana@correo.com" },
    });

    renderWithTheme(<AppointmentItem slot={slot as any} appt={appt as any} onClick={vi.fn()} />);

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    // Mientras carga
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
    // Luego el nombre
    await screen.findByText("Ana García");
  });

  it("estado 'Confirmado' pero getUserById falla: muestra 'Cliente'", async () => {
    const date = "2025-04-20T08:30:00.000Z";
    const slot = makeSlot(3, date, false);
    const appt = makeAppt(3, "ACEPTADO", 77);

    getUserByIdMock.mockRejectedValueOnce(new Error("boom"));

    renderWithTheme(<AppointmentItem slot={slot as any} appt={appt as any} onClick={vi.fn()} />);

    expect(screen.getByText("Confirmado")).toBeInTheDocument();

    // Tras el rechazo del fetch, debe mostrar "Cliente"
    await waitFor(() => {
      expect(screen.getByText("Cliente")).toBeInTheDocument();
    });
  });

  it("estado 'Rechazado' y appt sin userId: muestra 'Cliente'", () => {
    const date = "2025-05-01T12:00:00.000Z";
    const slot = makeSlot(4, date, false);
    const appt = makeAppt(4, "RECHAZADO"); // sin userId

    renderWithTheme(<AppointmentItem slot={slot as any} appt={appt as any} onClick={vi.fn()} />);

    expect(screen.getByText("Rechazado")).toBeInTheDocument();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
  });

  it("cuando hay appt sin userId (cualquier estado), muestra 'Cliente' sin intentar fetch", () => {
    const date = "2025-06-15T09:00:00.000Z";
    const slot = makeSlot(5, date, false);
    const appt = makeAppt(5, "ESPERA"); // sin userId

    renderWithTheme(<AppointmentItem slot={slot as any} appt={appt as any} onClick={vi.fn()} />);

    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(getUserByIdMock).not.toHaveBeenCalled();
  });
});
