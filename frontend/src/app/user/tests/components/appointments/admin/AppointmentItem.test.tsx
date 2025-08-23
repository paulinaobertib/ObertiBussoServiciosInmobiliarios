/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { AppointmentItem } from "../../../../components/appointments/admin/AppointmentItem";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock getUserById
vi.mock("../../../../../user/services/user.service", () => ({
  getUserById: vi.fn(),
}));
import { getUserById } from "../../../../../user/services/user.service";

describe("AppointmentItem", () => {
  const theme = createTheme();

  const renderWithTheme = (ui: React.ReactElement) =>
    render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

  const baseSlot = {
    id: 1,
    date: "2025-06-12T14:30:00",
    availability: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getUserById as unknown as Mock).mockResolvedValue({
      data: { id: 42, firstName: "Juan", lastName: "Pérez" },
    });
  });

  it("muestra hora y fecha, chip 'Disponible' y 'Libre' cuando no hay appt", () => {
    const onClick = vi.fn();

    renderWithTheme(<AppointmentItem slot={baseSlot as any} onClick={onClick} />);

    // Hora y fecha
    expect(screen.getByText("14:30")).toBeInTheDocument();
    expect(screen.getByText("12/06")).toBeInTheDocument();

    // Chip
    expect(screen.getByText("Disponible")).toBeInTheDocument();

    // Libre
    expect(screen.getByText("Libre")).toBeInTheDocument();
  });

  it("hace onClick(slot.id) al hacer click en el item", () => {
    const onClick = vi.fn();

    renderWithTheme(<AppointmentItem slot={baseSlot as any} onClick={onClick} />);

    // clic sobre un descendiente del Paper
    fireEvent.click(screen.getByText("14:30"));
    expect(onClick).toHaveBeenCalledWith(1);
  });

  it("ESPERA: muestra chip 'Pendiente' y carga el usuario (Cargando... → nombre)", async () => {
    const onClick = vi.fn();
    const slot = { ...baseSlot, availability: false };
    const appt = { id: 7, slotId: 1, status: "ESPERA", userId: 42 };

    renderWithTheme(<AppointmentItem slot={slot as any} appt={appt as any} onClick={onClick} />);

    // Chip
    expect(screen.getByText("Pendiente")).toBeInTheDocument();

    // primero muestra Cargando...
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();

    // luego muestra el nombre del usuario
    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });
  });

  it("ACEPTADO: muestra chip 'Confirmado' y nombre de usuario cuando carga", async () => {
    const onClick = vi.fn();
    const slot = { ...baseSlot, availability: false };
    const appt = { id: 8, slotId: 1, status: "ACEPTADO", userId: 42 };

    renderWithTheme(<AppointmentItem slot={slot as any} appt={appt as any} onClick={onClick} />);

    expect(screen.getByText("Confirmado")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });
  });

  it("RECHAZADO: muestra chip 'Rechazado'", () => {
    const onClick = vi.fn();
    const slot = { ...baseSlot, availability: false };
    const appt = { id: 9, slotId: 1, status: "RECHAZADO", userId: 42 };

    renderWithTheme(<AppointmentItem slot={slot as any} appt={appt as any} onClick={onClick} />);

    expect(screen.getByText("Rechazado")).toBeInTheDocument();
  });

  it("si getUserById falla, muestra 'Cliente' (sin nombre de usuario)", async () => {
    (getUserById as unknown as Mock).mockRejectedValueOnce(new Error("fail"));

    const onClick = vi.fn();
    const slot = { ...baseSlot, availability: false };
    const appt = { id: 10, slotId: 1, status: "ESPERA", userId: 999 };

    renderWithTheme(<AppointmentItem slot={slot as any} appt={appt as any} onClick={onClick} />);

    // mientras carga
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();

    // tras el fallo, debe mostrar "Cliente"
    await waitFor(() => {
      expect(screen.getByText("Cliente")).toBeInTheDocument();
    });

    // y no el nombre exitoso por defecto
    expect(screen.queryByText("Juan Pérez")).toBeNull();
  });

  it("cuando hay appt pero sin userId, no intenta cargar usuario y muestra 'Cliente'", () => {
    const onClick = vi.fn();
    const slot = { ...baseSlot, availability: false };
    const appt = { id: 11, slotId: 1, status: "ESPERA" }; // sin userId

    renderWithTheme(<AppointmentItem slot={slot as any} appt={appt as any} onClick={onClick} />);

    expect(getUserById).not.toHaveBeenCalled();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
  });
});
