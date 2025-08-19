/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IncreaseDialog } from "../../../components/increases/IncreaseDialog";

// ===== Mocks =====
vi.mock("../../../../shared/components/Modal", () => ({
  Modal: ({ open, title, children }: any) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

vi.mock("../../../components/increases/IncreaseForm", () => {
  const IncreaseForm = ({ initialValues, onChange }: any) => {
    const [local, setLocal] = require("react").useState(initialValues ?? {});
    require("react").useEffect(() => {
      setLocal(initialValues ?? {});
    }, [initialValues]);

    const setField =
      (f: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const val =
          f === "amount" || f === "frequency"
            ? Number(e.target.value)
            : e.target.value;
        const next = { ...local, [f]: val };
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
            value={String(local.amount ?? 0)}
            onChange={setField("amount")}
          />
        </label>
        <label>
          Moneda
          <button
            aria-label="Moneda"
            onClick={() => {
              // alterna entre ARS y USD para simplificar
              const next = { ...local, currency: local.currency === "USD" ? "ARS" : "USD" };
              setLocal(next);
              onChange(next);
            }}
          >
            {local.currency ?? "ARS"}
          </button>
        </label>
        <label>
          Frecuencia
          <input
            aria-label="Frecuencia"
            type="number"
            value={String(local.frequency ?? 12)}
            onChange={setField("frequency")}
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

// ===== Helpers =====
const fillForm = async (overrides?: {
  date?: string;
  amount?: string;
  currency?: "ARS" | "USD";
  frequency?: string;
}) => {
  const user = userEvent.setup();
  const date = screen.getByLabelText("Fecha") as HTMLInputElement;
  const amount = screen.getByLabelText("Monto") as HTMLInputElement;
  const currencyBtn = screen.getByLabelText("Moneda");
  const frequency = screen.getByLabelText("Frecuencia") as HTMLInputElement;

  if (overrides?.date) {
    await user.clear(date);
    await user.type(date, overrides.date);
  }
  if (overrides?.amount) {
    await user.clear(amount);
    await user.type(amount, overrides.amount);
  }
  if (overrides?.currency) {
    // nuestro mock alterna ARS/USD con un click; repetimos si hace falta
    const current = currencyBtn.textContent?.trim();
    if (current !== overrides.currency) await user.click(currencyBtn);
  }
  if (overrides?.frequency) {
    await user.clear(frequency);
    await user.type(frequency, overrides.frequency);
  }
};

const clickSave = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /guardar/i }));
};

// ===== Fixtures =====
const contractA = { id: 10 } as any;
const contractB = { id: 99 } as any;

describe("IncreaseDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no hace nada si contract es null (Guardar)", async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    render(<IncreaseDialog open={true} contract={null} onClose={onClose} onSaved={onSaved} />);

    await clickSave();

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
      frequency: "6",
    });

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
      frequency: 6,
      contractId: 10,
    });

    // onClose NO se llama en guardado (tu componente no lo hace)
    expect(onClose).not.toHaveBeenCalled();
  });

  it("maneja error: no llama onSaved", async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    (postContractIncrease as any).mockRejectedValueOnce(new Error("boom"));

    render(<IncreaseDialog open={true} contract={contractA} onClose={onClose} onSaved={onSaved} />);

    await fillForm({
      date: "2025-08-31",
      amount: "500",
      currency: "ARS",
      frequency: "12",
    });

    await clickSave();

    await waitFor(() => {
      expect(postContractIncrease).toHaveBeenCalledTimes(1);
      expect(onSaved).not.toHaveBeenCalled();
    });

    // debería haber re-habilitado botones
    expect(screen.getByRole("button", { name: /guardar/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).not.toBeDisabled();
  });

  it("resetea valores cuando cambia el contract", async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    const { rerender } = render(
      <IncreaseDialog open={true} contract={contractA} onClose={onClose} onSaved={onSaved} />
    );

    // completamos algo
    await fillForm({ date: "2025-09-01", amount: "42", currency: "USD", frequency: "3" });

    // cambia contrato -> efecto setea empty
    rerender(
      <IncreaseDialog open={true} contract={contractB} onClose={onClose} onSaved={onSaved} />
    );

    expect((screen.getByLabelText("Fecha") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Monto") as HTMLInputElement).value).toBe("0");
    expect(screen.getByLabelText("Moneda").textContent).toBe("ARS");
    expect((screen.getByLabelText("Frecuencia") as HTMLInputElement).value).toBe("12");
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

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await fillForm({ date: "2025-08-30", amount: "1", currency: "ARS", frequency: "12" });
    await clickSave();

    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();

    resolveFn({});
    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });
});
