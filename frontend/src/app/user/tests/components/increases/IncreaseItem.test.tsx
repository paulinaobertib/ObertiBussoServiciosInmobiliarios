/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";
import type { Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { IncreaseItem } from "../../../components/increases/IncreaseItem";

// ✅ Definimos el mock de forma HOISTED para poder usarlo en la factory de vi.mock
const { useAuthContextMock } = vi.hoisted(() => ({
  useAuthContextMock: vi.fn(() => ({ isAdmin: true })),
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuthContext: useAuthContextMock,
}));

vi.mock("../../../services/contractIncrease.service", () => ({
  updateContractIncrease: vi.fn(),
}));
import { updateContractIncrease } from "../../../services/contractIncrease.service";

const renderWithTheme = (ui: ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("IncreaseItem (real)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("dispara onDelete cuando se hace clic en Eliminar", async () => {
    const increase = {
      id: 99,
      date: "2025-08-01T00:00:00Z",
      amount: 77,
      currency: "ARS",
      frequency: 12,
    } as any;

    const onDelete = vi.fn();

    renderWithTheme(<IncreaseItem increase={increase} onDelete={onDelete} />);

    await userEvent.click(screen.getByTestId("DeleteIcon").closest("button")!);
    expect(onDelete).toHaveBeenCalledWith(increase);
  });

  it("no llama updateContractIncrease si no hay cambios y cierra el modo edición", async () => {
    const increase = {
      id: 5,
      date: "2025-10-01T00:00:00Z",
      amount: 123,
      currency: "USD",
      frequency: 6,
    } as any;

    renderWithTheme(<IncreaseItem increase={increase} />);

    await userEvent.click(screen.getByTestId("EditIcon").closest("button")!);
    await userEvent.click(screen.getByTestId("SaveIcon").closest("button")!);

    await waitFor(() => {
      expect(updateContractIncrease).not.toHaveBeenCalled();
    });

    expect(screen.getByTestId("EditIcon")).toBeInTheDocument();
  });

  // ────────── Tests extra para subir cobertura ──────────

  it("muestra primario y entra a edición (aplica fondo en modo edición)", async () => {
    const increase = {
      id: 1,
      date: "2025-09-01T00:00:00Z",
      amount: 100,
      currency: "ARS",
      frequency: 12,
    } as any;

    renderWithTheme(<IncreaseItem increase={increase} />);

    expect(screen.getByText("2025-09-01 - 100 ARS")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("EditIcon").closest("button")!);

    // Campos de edición visibles
    expect(screen.getByLabelText("Monto")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha")).toBeInTheDocument();

    // Verificamos el background fallback (#f0f0f0 -> rgb(240, 240, 240))
    const listitem = screen.getByRole("listitem");
    expect(listitem).toHaveStyle({ backgroundColor: "rgb(240, 240, 240)" });
  });

  it("guarda con cambios: llama updateContractIncrease y onEdit", async () => {
    const increase = {
      id: 10,
      date: "2025-09-01T00:00:00Z",
      amount: 100,
      currency: "ARS",
      frequency: 12,
    } as any;

    const onEdit = vi.fn();
    (updateContractIncrease as unknown as Mock).mockResolvedValue({});

    renderWithTheme(<IncreaseItem increase={increase} onEdit={onEdit} />);

    await userEvent.click(screen.getByTestId("EditIcon").closest("button")!);

    const amount = screen.getByLabelText("Monto") as HTMLInputElement;
    await userEvent.clear(amount);
    await userEvent.type(amount, "250");

    const date = screen.getByLabelText("Fecha") as HTMLInputElement;
    await userEvent.clear(date);
    await userEvent.type(date, "2025-09-15");

    await userEvent.click(screen.getByTestId("SaveIcon").closest("button")!);

    await waitFor(() => {
      expect(updateContractIncrease).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    const payload = (updateContractIncrease as unknown as Mock).mock.calls[0][0];
    expect(payload).toMatchObject({
      id: 10,
      amount: 250,
      currency: "ARS",
      date: "2025-09-15",
    });
  });

  it("oculta acciones (editar/eliminar) cuando isAdmin es false", async () => {
    // cambiamos el mock SOLO para este render
    useAuthContextMock.mockReturnValueOnce({ isAdmin: false });

    const increase = {
      id: 3,
      date: "2025-07-01T00:00:00Z",
      amount: 10,
      currency: "ARS",
      frequency: 12,
    } as any;

    renderWithTheme(<IncreaseItem increase={increase} />);

    expect(screen.queryByTestId("EditIcon")).toBeNull();
    expect(screen.queryByTestId("DeleteIcon")).toBeNull();
  });
});
