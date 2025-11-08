/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import type React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AppointmentsList } from "../../../../../user/components/appointments/admin/AppointmentsList";

vi.mock("../../../../../user/components/appointments/admin/AppointmentItem", () => {
  return {
    AppointmentItem: (props: {
      slot: { id: number; date: string; availability: boolean };
      appt?: any;
      onClick: (id: number) => void;
    }) => {
      return (
        <div data-testid={`row-${props.slot.id}`}>
          <span data-testid="slot-id">{props.slot.id}</span>
          <span data-testid="slot-date">{props.slot.date}</span>
          <button onClick={() => props.onClick(props.slot.id)} data-testid="btn">
            sel
          </button>
          <span data-testid="has-appt">{props.appt ? "yes" : "no"}</span>
          <span data-testid="appt-status">{props.appt?.status ?? ""}</span>
        </div>
      );
    },
  };
});

const theme = createTheme();
const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const slots = [
  { id: 3, date: "2025-06-12T15:00:00", availability: false },
  { id: 1, date: "2025-06-12T13:00:00", availability: true },
  { id: 4, date: "2025-06-12T16:00:00", availability: false },
  { id: 2, date: "2025-06-12T14:00:00", availability: false },
];

const mkAppt = (
  slot: { id: number; date: string; availability: boolean },
  status: "ESPERA" | "ACEPTADO" | "RECHAZADO"
) => ({
  id: 100 + slot.id,
  slotId: slot.id,
  status,
  userId: 999,
  availableAppointment: slot,
  appointmentDate: slot.date,
});

const apptsBySlotFull: Record<number, any> = {
  2: mkAppt(slots.find((s) => s.id === 2)!, "ESPERA"),
  3: mkAppt(slots.find((s) => s.id === 3)!, "ACEPTADO"),
};

describe("AppointmentsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cuando slots está vacío, muestra el mensaje de vacío", () => {
    renderWithTheme(<AppointmentsList slots={[]} apptsBySlot={{}} onSelect={vi.fn()} />);
    expect(screen.getByText(/No hay turnos disponibles para esta fecha\./i)).toBeInTheDocument();
  });

  it("ordena los slots por fecha ascendente y renderiza un item por slot", () => {
    renderWithTheme(<AppointmentsList slots={slots as any} apptsBySlot={{}} onSelect={vi.fn()} />);

    const rows = screen.getAllByTestId(/row-/);
    expect(rows).toHaveLength(4);

    const order = rows.map((row) => within(row).getByTestId("slot-id").textContent);
    expect(order).toEqual(["1", "2", "3", "4"]);
  });

  it("propaga onSelect(slotId) cuando se hace click en el item", () => {
    const onSelect = vi.fn();
    renderWithTheme(<AppointmentsList slots={slots as any} apptsBySlot={{}} onSelect={onSelect} />);

    const firstRow = screen.getAllByTestId(/row-/)[0];
    fireEvent.click(within(firstRow).getByTestId("btn"));

    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("pasa el appt correspondiente al AppointmentItem (solo para slots con turno)", () => {
    renderWithTheme(<AppointmentsList slots={slots as any} apptsBySlot={apptsBySlotFull as any} onSelect={vi.fn()} />);

    const rows = screen.getAllByTestId(/row-/);

    expect(within(rows[0]).getByTestId("has-appt").textContent).toBe("no");
    expect(within(rows[1]).getByTestId("appt-status").textContent).toBe("ESPERA");
    expect(within(rows[2]).getByTestId("appt-status").textContent).toBe("ACEPTADO");
    expect(within(rows[3]).getByTestId("has-appt").textContent).toBe("no");
  });
});
