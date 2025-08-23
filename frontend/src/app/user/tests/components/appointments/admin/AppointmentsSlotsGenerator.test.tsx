/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import React from "react";
import dayjs from "dayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { GenerateSlotsDialog } from "../../../../../user/components/appointments/admin/AppointmentsSlotsGenerator";

vi.mock("../../../../../user/hooks/useAppointments", () => ({
  useAppointments: vi.fn(),
}));
import { useAppointments } from "../../../../../user/hooks/useAppointments";

vi.mock("../../../../../shared/components/Modal", () => ({
  Modal: ({ open, title, onClose, children }: any) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose}>cerrar</button>
        {children}
      </div>
    ) : null,
}));

// Mock liviano del Calendar: solo nos permite disparar onSelectDate
vi.mock("../../../../../user/components/appointments/Calendar", () => ({
  Calendar: ({ onSelectDate }: { initialDate: any; onSelectDate: (d: any) => void }) => (
    <div data-testid="calendar">
      <button data-testid="pick-date" onClick={() => onSelectDate(dayjs("2025-06-15"))}>
        pick
      </button>
    </div>
  ),
}));

const theme = createTheme();
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("GenerateSlotsDialog", () => {
  const genDate = dayjs("2025-06-12");
  let setGenDate: Mock;
  let setGenStartTime: Mock;
  let setGenEndTime: Mock;
  let generateSlots: Mock;

  const getHookValue = () => ({
    genDate,
    setGenDate,
    genStartTime: "09:00",
    setGenStartTime,
    genEndTime: "10:30",
    setGenEndTime,
    generateSlots,
  });

  const mockHook = (over?: Partial<ReturnType<typeof getHookValue>>) => {
    (useAppointments as unknown as Mock).mockReturnValue({
      ...getHookValue(),
      ...(over ?? {}),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setGenDate = vi.fn();
    setGenStartTime = vi.fn();
    setGenEndTime = vi.fn();
    generateSlots = vi.fn().mockResolvedValue({});
  });

  const renderDlg = (props?: Partial<React.ComponentProps<typeof GenerateSlotsDialog>>) => {
    renderWithTheme(<GenerateSlotsDialog open={true} onClose={vi.fn()} {...props} />);
  };

  it("muestra la cantidad de turnos (cada 30') calculada desde el hook (09:00–10:30 → 3)", () => {
    mockHook();
    renderDlg();

    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("3")).toBeInTheDocument();

    expect(screen.getByLabelText("Desde")).toHaveValue("09:00");
    expect(screen.getByLabelText("Hasta")).toHaveValue("10:30");
  });

  it("deshabilita 'Generar' cuando no hay slots (inicio == fin)", () => {
    mockHook({ genStartTime: "09:00", genEndTime: "09:00" });
    renderDlg();

    const btn = screen.getByRole("button", { name: /generar/i });
    expect(btn).toBeDisabled();
  });

  it("clic en 'Generar' llama generateSlots y luego onClose", async () => {
    const onClose = vi.fn();
    mockHook();
    renderWithTheme(<GenerateSlotsDialog open={true} onClose={onClose} />);

    const btn = screen.getByRole("button", { name: /generar/i });
    fireEvent.click(btn);

    await waitFor(() => expect(generateSlots).toHaveBeenCalled());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

});
