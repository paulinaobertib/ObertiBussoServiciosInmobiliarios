import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import dayjs, { Dayjs } from "dayjs";
import { Calendar } from "../../components/Calendar";
import React from "react";

// ---- Mocks de los componentes de MUI X ----
let lastDateCalendarProps: any = null;

vi.mock("@mui/x-date-pickers/LocalizationProvider", () => {
  // Un wrapper mínimo que solo renderiza children
  return {
    LocalizationProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="lp">{children}</div>
    ),
  };
});

vi.mock("@mui/x-date-pickers/AdapterDayjs", () => {
  // No lo usamos directamente en el test, pero el Calendar lo importa
  return { AdapterDayjs: {} };
});

vi.mock("@mui/x-date-pickers/DateCalendar", () => {
  return {
    DateCalendar: (props: any) => {
      lastDateCalendarProps = props;
      // dos botones para simular selección válida y onChange(null)
      return (
        <div>
          <button data-testid="pick-valid" onClick={() => props.onChange(dayjs("2025-06-12"))}>
            pick-valid
          </button>
          <button data-testid="pick-null" onClick={() => props.onChange(null)}>
            pick-null
          </button>
          <div data-testid="value-string">
            {props.value ? String(props.value.toISOString?.() ?? props.value) : "no-value"}
          </div>
        </div>
      );
    },
  };
});

// Reset entre tests
beforeEach(() => {
  lastDateCalendarProps = null;
});

describe("<Calendar />", () => {
  it("pasa el initialDate como value al DateCalendar y setea disablePast/shouldDisableDate", () => {
    const initial = dayjs("2025-06-10T10:00:00.000Z");
    const onSelectDate = vi.fn();

    render(<Calendar initialDate={initial} onSelectDate={onSelectDate} />);

    // Capturamos las props que el Calendar le pasó al DateCalendar
    expect(lastDateCalendarProps).toBeTruthy();
    // value = initialDate
    expect(dayjs.isDayjs(lastDateCalendarProps.value)).toBe(true);
    expect((lastDateCalendarProps.value as Dayjs).toISOString()).toBe(initial.toISOString());

    // disablePast debe venir en true
    expect(lastDateCalendarProps.disablePast).toBe(true);

    // shouldDisableDate deshabilita fines de semana
    // Sábado 2025-06-14 -> true
    expect(lastDateCalendarProps.shouldDisableDate(dayjs("2025-06-14"))).toBe(true);
    // Domingo 2025-06-15 -> true
    expect(lastDateCalendarProps.shouldDisableDate(dayjs("2025-06-15"))).toBe(true);
    // Lunes 2025-06-16 -> false
    expect(lastDateCalendarProps.shouldDisableDate(dayjs("2025-06-16"))).toBe(false);
  });

  it("al seleccionar un día válido llama onSelectDate y el value se actualiza", async () => {
    const initial = dayjs("2025-06-10T10:00:00.000Z");
    const onSelectDate = vi.fn();

    render(<Calendar initialDate={initial} onSelectDate={onSelectDate} />);

    // value inicial visible en el mock
    expect(screen.getByTestId("value-string").textContent).toContain(initial.toISOString());

    // clic en el botón que simula onChange con un día válido
    fireEvent.click(screen.getByTestId("pick-valid"));

    // onSelectDate recibe la fecha
    expect(onSelectDate).toHaveBeenCalledTimes(1);
    const picked = dayjs("2025-06-12");
    const calledArg = onSelectDate.mock.calls[0][0] as Dayjs;
    expect(dayjs.isDayjs(calledArg)).toBe(true);
    expect(calledArg.toISOString()).toBe(picked.toISOString());

    // el componente debe re-renderizar con el nuevo value (estado interno actualizado)
    await waitFor(() =>
      expect(screen.getByTestId("value-string").textContent).toContain(picked.toISOString())
    );
  });

  it("si onChange recibe null no llama onSelectDate ni cambia el value", async () => {
    const initial = dayjs("2025-06-10T10:00:00.000Z");
    const onSelectDate = vi.fn();

    render(<Calendar initialDate={initial} onSelectDate={onSelectDate} />);

    const before = screen.getByTestId("value-string").textContent;
    fireEvent.click(screen.getByTestId("pick-null"));

    // No se llamó al callback externo
    expect(onSelectDate).not.toHaveBeenCalled();
    // El value no cambió
    expect(screen.getByTestId("value-string").textContent).toBe(before);
  });

  it("si no se pasa initialDate, usa dayjs() como valor inicial", () => {
    const onSelectDate = vi.fn();
    render(<Calendar onSelectDate={onSelectDate} />);

    // value existe y es un Dayjs (no validamos el timestamp exacto para evitar flakiness)
    expect(lastDateCalendarProps).toBeTruthy();
    expect(dayjs.isDayjs(lastDateCalendarProps.value)).toBe(true);
  });

    it("renderiza dentro de LocalizationProvider (mockeado) y expone el contenido", () => {
    const onSelectDate = vi.fn();
    render(<Calendar onSelectDate={onSelectDate} />);
    expect(screen.getByTestId("lp")).toBeInTheDocument(); // wrapper del provider
    // y el DateCalendar mock está adentro (usa el div con value-string como prueba de vida)
    expect(screen.getByTestId("value-string")).toBeInTheDocument();
  });

  it("pasa estilos de layout en sx al DateCalendar", () => {
    const initial = dayjs("2025-06-10T10:00:00.000Z");
    const onSelectDate = vi.fn();

    render(<Calendar initialDate={initial} onSelectDate={onSelectDate} />);

    expect(lastDateCalendarProps).toBeTruthy();
    // Verificamos que el sx contenga las claves de layout declaradas en el componente
    expect(lastDateCalendarProps.sx).toEqual(
      expect.objectContaining({
        width: "100%",
        maxWidth: 360,
        mx: "auto",
      })
    );
  });
});
