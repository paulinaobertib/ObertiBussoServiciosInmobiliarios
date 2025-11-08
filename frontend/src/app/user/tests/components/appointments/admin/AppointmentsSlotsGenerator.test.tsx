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

// Mock del Calendar con el MISMO specifier relativo que usa el componente:
// NoticesSlotsGenerator.tsx hace import { Calendar } from '../../Calendar'
vi.mock("../../../../../user/components/appointments/admin/../../Calendar", () => ({
  Calendar: ({ onSelectDate }: { onSelectDate: (d: any) => void }) => (
    <div data-testid="calendar">
      <button data-testid="pick-date" onClick={() => onSelectDate(require("dayjs")("2025-06-15"))}>
        pick
      </button>
    </div>
  ),
}));

const theme = createTheme();
const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

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

  it("Calendar: seleccionar fecha dispara setGenDate con el Dayjs recibido", async () => {
    setGenDate = vi.fn();
    mockHook({ setGenDate });

    renderDlg();

    // Esperar a que aparezca el Calendar mockeado
    await screen.findByTestId("calendar");

    fireEvent.click(screen.getByTestId("pick-date"));
    expect(setGenDate).toHaveBeenCalledTimes(1);

    const arg = setGenDate.mock.calls[0][0];
    const dayjs = require("dayjs");
    expect(dayjs.isDayjs(arg)).toBe(true);
    expect(arg.toISOString()).toBe(dayjs("2025-06-15").toISOString());
  });

  it("cambiar 'Desde' y 'Hasta' actualiza el hook vía setGenStartTime / setGenEndTime", () => {
    setGenStartTime = vi.fn();
    setGenEndTime = vi.fn();
    mockHook({ setGenStartTime, setGenEndTime });

    renderDlg();

    fireEvent.change(screen.getByLabelText("Desde"), { target: { value: "08:30" } });
    fireEvent.change(screen.getByLabelText("Hasta"), { target: { value: "11:00" } });

    expect(setGenStartTime).toHaveBeenCalledWith("08:30");
    expect(setGenEndTime).toHaveBeenCalledWith("11:00");
  });

  it("recalcula la cantidad de turnos al re-render (09:00–12:00 → 6)", () => {
    mockHook({ genStartTime: "09:00", genEndTime: "10:30" });
    const { rerender } = renderWithTheme(<GenerateSlotsDialog open={true} onClose={vi.fn()} />);

    // primero: 09:00..10:30 → 3
    let alert = screen.getByRole("alert");
    expect(within(alert).getByText("3")).toBeInTheDocument();

    // cambiamos el retorno del hook y re-renderizamos
    mockHook({ genStartTime: "09:00", genEndTime: "12:00" });
    rerender(<GenerateSlotsDialog open={true} onClose={vi.fn()} />);

    alert = screen.getByRole("alert");
    // 09:00, 09:30, 10:00, 10:30, 11:00, 11:30 → 6
    expect(within(alert).getByText("6")).toBeInTheDocument();
  });

  it("si el fin es anterior al inicio (12:00–11:00) muestra 0 y deshabilita 'Generar'", () => {
    mockHook({ genStartTime: "12:00", genEndTime: "11:00" });
    renderDlg();

    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("0")).toBeInTheDocument();

    const btn = screen.getByRole("button", { name: /generar/i });
    expect(btn).toBeDisabled();
  });

  it("mientras generateSlots está pendiente, el botón 'Generar' queda deshabilitado", async () => {
    let resolve!: () => void;
    generateSlots = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    mockHook({ generateSlots });

    renderDlg();

    const btn = screen.getByRole("button", { name: /generar/i });
    expect(btn).not.toBeDisabled();

    fireEvent.click(btn);
    // Debe deshabilitarse por 'submitting'
    expect(btn).toBeDisabled();

    // resolvemos y verificamos que vuelve a habilitarse tras el cierre
    resolve();
    await waitFor(() => expect(generateSlots).toHaveBeenCalled());
  });

  it("el botón 'cerrar' del modal invoca onClose", () => {
    const onClose = vi.fn();
    mockHook();

    renderWithTheme(<GenerateSlotsDialog open={true} onClose={onClose} />);

    fireEvent.click(screen.getByText("cerrar"));
    expect(onClose).toHaveBeenCalled();
  });

  it("cuando open=false no renderiza el modal", () => {
    mockHook();

    renderWithTheme(<GenerateSlotsDialog open={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("modal")).toBeNull();
  });
});
