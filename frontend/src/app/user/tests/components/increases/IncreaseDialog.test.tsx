/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { IncreaseDialog } from "../../../components/increases/IncreaseDialog";

/* ================= Mocks ================ */
vi.mock("../../../../shared/components/Modal", () => ({
  Modal: ({ open, title, children }: any) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => ({ showAlert: vi.fn() }),
}));

vi.mock("../../../components/increases/IncreaseForm", () => {
  const IncreaseForm = ({ initialValues, onChange }: any) => {
    const React = require("react");
    const [local, setLocal] = React.useState(initialValues ?? {});
    React.useEffect(() => {
      setLocal(initialValues ?? {});
    }, [initialValues]);

    const setField =
      (f: string) =>
      (e: any) => {
        const raw = e?.target?.value ?? "";
        const next = { ...local, [f]: raw };
        setLocal(next);
        onChange(next);
      };

    const toggleCurrency = () => {
      const next = { ...local, currency: local.currency === "USD" ? "ARS" : "USD" };
      setLocal(next);
      onChange(next);
    };

    return (
      <div>
        <label>
          Fecha
          <input
            aria-label="Fecha"
            type="date"
            value={local.date ?? ""}
            onChange={setField("date")}
          />
        </label>

        <label>
          Monto
          <input
            aria-label="Monto"
            type="number"
            value={local.amount ?? ""}
            onChange={setField("amount")}
          />
        </label>

        <label>
          Moneda
          <button aria-label="Moneda" onClick={toggleCurrency}>
            {(local.currency as string) || "—"}
          </button>
        </label>

        <label>
          Ajuste
          <input
            aria-label="Ajuste"
            type="number"
            value={local.adjustment ?? ""}
            onChange={setField("adjustment")}
          />
        </label>

        <label>
          Nota
          <textarea
            aria-label="Nota"
            value={local.note ?? ""}
            onChange={setField("note")}
          />
        </label>
      </div>
    );
  };
  return { IncreaseForm };
});

vi.mock("../../../services/contractIncrease.service", () => ({
  postContractIncrease: vi.fn(),
}));
import { postContractIncrease } from "../../../services/contractIncrease.service";

/* ============== Helpers ============== */
const fillForm = async (overrides?: {
  date?: string; 
  amount?: string; 
  currency?: "ARS" | "USD";
  adjustment?: string;
  note?: string; 
}) => {
  const user = userEvent.setup();
  const date = screen.getByLabelText("Fecha") as HTMLInputElement;
  const amount = screen.getByLabelText("Monto") as HTMLInputElement;
  const currencyBtn = screen.getByLabelText("Moneda");
  const adjustment = screen.getByLabelText("Ajuste") as HTMLInputElement;
  const note = screen.getByLabelText("Nota") as HTMLTextAreaElement;

  if (overrides?.date !== undefined) {
    await user.clear(date);
    if (overrides.date !== "") await user.type(date, overrides.date);
  }
  if (overrides?.amount !== undefined) {
    await user.clear(amount);
    if (overrides.amount !== "") await user.type(amount, overrides.amount);
  }
  if (overrides?.adjustment !== undefined) {
    await user.clear(adjustment);
    if (overrides.adjustment !== "") await user.type(adjustment, overrides.adjustment);
  }
  if (overrides?.note !== undefined) {
    await user.clear(note);
    if (overrides.note !== "") await user.type(note, overrides.note);
  }
  if (overrides?.currency) {
    const current = currencyBtn.textContent?.trim();
    if (current !== overrides.currency) await user.click(currencyBtn);
  }
};

const clickSave = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /guardar/i }));
};

/* ============== Fixtures ============== */
const contractA = { id: 10, adjustmentIndex: { id: 7 } } as any;
const contractB = { id: 99, adjustmentIndex: { id: 5 } } as any;

/* ============== Tests ============== */
describe("IncreaseDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no hace nada si contract es null (Guardar)", async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    render(<IncreaseDialog open={true} contract={null} onClose={onClose} onSaved={onSaved} />);

    // Guardar está deshabilitado (sin contrato/índice) no lo clickeamos
    expect(screen.getByRole("button", { name: /^guardar$/i })).toBeDisabled();

    expect(postContractIncrease).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("guarda OK: payload correcto + deshabilita botones y llama onSaved", async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    let resolveFn: (v?: unknown) => void = () => {};
    (postContractIncrease as any).mockImplementation(
      () => new Promise((res) => (resolveFn = res))
    );

    render(<IncreaseDialog open={true} contract={contractA} onClose={onClose} onSaved={onSaved} />);

    await fillForm({
      date: "2025-08-30",
      amount: "1234",
      currency: "USD",
      adjustment: "15",
      note: "Observación de prueba",
    });

    expect(screen.getByRole("button", { name: /^guardar$/i })).toBeEnabled();

    await clickSave();

    // mientras guarda
    expect(screen.getByRole("button", { name: /guardando…/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();

    // termina ok
    resolveFn({});
    await waitFor(() => {
      expect(postContractIncrease).toHaveBeenCalledTimes(1);
      expect(onSaved).toHaveBeenCalledTimes(1);
    });

    expect(postContractIncrease).toHaveBeenCalledWith({
      date: "2025-08-30T00:00:00",
      amount: 1234,
      currency: "USD",
      indexId: 7,
      contractId: 10,
      note: "Observación de prueba",
      adjustment: 15,
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("maneja error: no llama onSaved y re-habilita botones", async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    (postContractIncrease as any).mockRejectedValueOnce(new Error("boom"));

    render(<IncreaseDialog open={true} contract={contractA} onClose={onClose} onSaved={onSaved} />);

    await fillForm({
      date: "2025-08-31",
      amount: "500",
      currency: "ARS",
      adjustment: "",
      note: "", 
    });

    await clickSave();

    await waitFor(() => {
      expect(postContractIncrease).toHaveBeenCalledTimes(1);
      expect(onSaved).not.toHaveBeenCalled();
    });

    // re-habilitados
    expect(screen.getByRole("button", { name: /^guardar$/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeEnabled();
  });

  it("resetea valores cuando cambia el contract", async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    const { rerender } = render(
      <IncreaseDialog open={true} contract={contractA} onClose={onClose} onSaved={onSaved} />
    );

    await fillForm({
      date: "2025-09-01",
      amount: "42",
      currency: "USD",
      adjustment: "10",
      note: "Hola",
    });

    rerender(
      <IncreaseDialog open={true} contract={contractB} onClose={onClose} onSaved={onSaved} />
    );

    expect((screen.getByLabelText("Fecha") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Monto") as HTMLInputElement).value).toBe("");
    expect(screen.getByLabelText("Moneda").textContent).toBe("—");
    expect((screen.getByLabelText("Ajuste") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Nota") as HTMLTextAreaElement).value).toBe("");
  });

  it("Cancelar llama onClose y se deshabilita mientras guarda", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSaved = vi.fn();

    let resolveFn: (v?: unknown) => void = () => {};
    (postContractIncrease as any).mockImplementation(
      () => new Promise((res) => (resolveFn = res))
    );

    render(<IncreaseDialog open={true} contract={contractA} onClose={onClose} onSaved={onSaved} />);

    // cancelar cuando no está guardando
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await fillForm({ date: "2025-08-30", amount: "1", currency: "ARS", adjustment: "", note: "" });
    await clickSave();

    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();

    resolveFn({});
    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });
});
