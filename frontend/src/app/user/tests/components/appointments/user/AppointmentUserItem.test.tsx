/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppointmentUserItem } from "../../../../components/appointments/user/AppointmentUserItem";
import { useMediaQuery, useTheme } from "@mui/material";
import type { Appointment, AvailableAppointment } from "../../../../types/appointment";

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual<any>("@mui/material");
  return {
    ...actual,
    useMediaQuery: vi.fn(),
    useTheme: vi.fn(),
  };
});

describe("AppointmentUserItem", () => {
  const onCancel = vi.fn(() => Promise.resolve());
  const afterCancel = vi.fn();
  const theme = { breakpoints: { down: vi.fn() }, palette: { grey: { 100: "#eee", 300: "#ccc" } } };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTheme as any).mockReturnValue(theme);
    (useMediaQuery as any).mockReturnValue(false);
  });

  const slot: AvailableAppointment = { id: 1, date: "2025-08-20T10:00:00", availability: true };
  const appointment: Appointment = {
    id: 1,
    status: "ESPERA",
    userId: "1",
    availableAppointment: slot,
    appointmentDate: slot.date,
    comment: "Nota de prueba",
  };

  it("muestra la fecha, chip de estado y notas", () => {
    render(<AppointmentUserItem appointment={appointment} slot={slot} onCancel={onCancel} afterCancel={afterCancel} />);

    expect(screen.getByText(/20 de agosto, a las 10:00/i)).toBeInTheDocument();
    expect(screen.getByText(/Pendiente/i)).toBeInTheDocument();
    expect(screen.getByText(/Nota de prueba/i)).toBeInTheDocument();
  });

  it("llama onCancel y afterCancel al presionar el botón", async () => {
    render(<AppointmentUserItem appointment={appointment} slot={slot} onCancel={onCancel} afterCancel={afterCancel} />);

    const btn = screen.getByRole("button", { name: /Cancelar/i });
    await fireEvent.click(btn);

    expect(onCancel).toHaveBeenCalledWith(appointment.id);

    await waitFor(() => {
      expect(afterCancel).toHaveBeenCalled();
    });
  });

  it("renderiza correctamente en modo móvil", () => {
    (useMediaQuery as any).mockReturnValue(true);

    render(<AppointmentUserItem appointment={appointment} slot={slot} onCancel={onCancel} afterCancel={afterCancel} />);

    expect(screen.getByText(/Pendiente/i)).toBeInTheDocument();
    expect(screen.getByText(/Nota de prueba/i)).toBeInTheDocument();
  });

  it("muestra guion si no hay comentario", () => {
    const apptNoComment = { ...appointment, comment: "" };
    render(
      <AppointmentUserItem appointment={apptNoComment} slot={slot} onCancel={onCancel} afterCancel={afterCancel} />
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
