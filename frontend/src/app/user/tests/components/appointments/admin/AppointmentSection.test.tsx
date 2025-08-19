/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { AppointmentSection } from "../../../../../user/components/appointments/admin/AppointmentSection";

type MockedListProps = {
  slots: Array<{ id: number }>;
  apptsBySlot: Record<number, any>;
  onSelect: (id: number) => void;
};

let lastListProps: MockedListProps | null = null;

vi.mock("../../../../../user/components/appointments/admin/AppointmentsList", () => {
  return {
    AppointmentsList: (props: MockedListProps) => {
      lastListProps = props;
      return (
        <div data-testid="appointments-list">
          {props.slots.map((s) => (
            <button
              key={s.id}
              data-testid={`slot-${s.id}`}
              onClick={() => props.onSelect(s.id)}
            >
              {s.id}
            </button>
          ))}
        </div>
      );
    },
  };
});

// helper para renderizar con theme
const theme = createTheme();
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("AppointmentSection", () => {
  const baseDate = dayjs("2025-06-12T14:30:00");
  const dateKey = baseDate.format("YYYY-MM-DD");

  // slots del día (simulan AvailableAppointment)
  const slots = [
    { id: 1, date: "2025-06-12T13:00:00", availability: true },
    { id: 2, date: "2025-06-12T14:00:00", availability: false },
    { id: 3, date: "2025-06-12T15:00:00", availability: false },
    { id: 4, date: "2025-06-12T16:00:00", availability: false },
  ];

  // Factory para cumplir con el tipo Appointment de tu proyecto
  const mkAppt = (slotId: number, status: "ESPERA" | "ACEPTADO" | "RECHAZADO") => {
    const slot = slots.find((s) => s.id === slotId)!;
    return {
      id: 100 + slotId,
      slotId,
      status,
      userId: 999,
      availableAppointment: slot,
      appointmentDate: slot.date,
    };
  };

  const apptsBySlotFull: Record<number, any> = {
    2: mkAppt(2, "ESPERA"),
    3: mkAppt(3, "ACEPTADO"),
    4: mkAppt(4, "RECHAZADO"),
  };

  const commonProps = (
    over?: Partial<React.ComponentProps<typeof AppointmentSection>>
  ): React.ComponentProps<typeof AppointmentSection> => ({
    loading: false,
    selectedDate: baseDate as any,
    filter: "TODOS",
    setFilter: vi.fn(),
    slotsByDate: { [dateKey]: slots as any },
    apptsBySlot: { ...apptsBySlotFull } as any,
    onSelectSlot: vi.fn(),
    ...(over as any),
  });

  beforeEach(() => {
    lastListProps = null;
  });

  it("cuando loading=true, muestra CircularProgress y NO renderiza encabezado/lista", () => {
    renderWithTheme(<AppointmentSection {...commonProps({ loading: true })} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByTestId("appointments-list")).toBeNull();
  });

  it("renderiza el encabezado con la fecha del día seleccionado", () => {
    renderWithTheme(<AppointmentSection {...commonProps()} />);
    // Verificamos por partes estables (evitamos locale):
    expect(screen.getByText((t) => /12/.test(t) && /2025/.test(t))).toBeInTheDocument();
  });

  it("filtro = TODOS → pasa todos los slots del día a AppointmentsList", () => {
    renderWithTheme(<AppointmentSection {...commonProps({ filter: "TODOS" })} />);
    expect(lastListProps).not.toBeNull();
    expect(lastListProps!.slots.map((s) => s.id)).toEqual([1, 2, 3, 4]);
  });

  it("filtro = DISPONIBLE → solo slots availability=true", () => {
    renderWithTheme(<AppointmentSection {...commonProps({ filter: "DISPONIBLE" })} />);
    expect(lastListProps).not.toBeNull();
    expect(lastListProps!.slots.map((s) => s.id)).toEqual([1]);
  });

  it("filtro = ESPERA → solo slots cuyo appt.status === 'ESPERA'", () => {
    renderWithTheme(<AppointmentSection {...commonProps({ filter: "ESPERA" })} />);
    expect(lastListProps).not.toBeNull();
    expect(lastListProps!.slots.map((s) => s.id)).toEqual([2]);
  });

  it("filtro = ACEPTADO → solo slots con status 'ACEPTADO'", () => {
    renderWithTheme(<AppointmentSection {...commonProps({ filter: "ACEPTADO" })} />);
    expect(lastListProps).not.toBeNull();
    expect(lastListProps!.slots.map((s) => s.id)).toEqual([3]);
  });

  it("filtro = RECHAZADO → solo slots con status 'RECHAZADO'", () => {
    renderWithTheme(<AppointmentSection {...commonProps({ filter: "RECHAZADO" })} />);
    expect(lastListProps).not.toBeNull();
    expect(lastListProps!.slots.map((s) => s.id)).toEqual([4]);
  });

  it("click en un item de la lista propaga onSelectSlot(id)", () => {
    const onSelectSlot = vi.fn();
    renderWithTheme(<AppointmentSection {...commonProps({ onSelectSlot })} />);
    fireEvent.click(screen.getByTestId("slot-3"));
    expect(onSelectSlot).toHaveBeenCalledWith(3);
  });
});
