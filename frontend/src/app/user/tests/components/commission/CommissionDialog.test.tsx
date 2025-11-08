import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("@mui/material/styles", () => ({}));

const modalCalls: any[] = [];
vi.mock("../../../../shared/components/Modal", () => ({
  Modal: (props: any) => {
    modalCalls.push(props);
    return (
      <div data-testid="modal" data-open={String(props.open)}>
        <div data-testid="modal-title">{props.title}</div>
        <button data-testid="modal-close" onClick={props.onClose}>
          modal-close
        </button>
        {props.children}
      </div>
    );
  },
}));

const formCalls: any[] = [];

vi.mock("../../../components/commission/CommissionForm", () => ({
  CommissionForm: (props: any) => {
    formCalls.push(props);
    return (
      <div data-testid="commission-form" data-action={props.action ?? ""}>
        <button data-testid="form-success" onClick={() => props.onSuccess?.()}>
          form-success
        </button>
        <div data-testid="form-item">{props.item ? JSON.stringify(props.item) : ""}</div>
        <div data-testid="form-contract">{props.contractId ?? ""}</div>
      </div>
    );
  },
}));

import { CommissionDialog } from "../../../components/commission/CommissionDialog";
import type { Commission } from "../../../types/commission";

beforeEach(() => {
  modalCalls.length = 0;
  formCalls.length = 0;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const makeCommission = (over: Partial<Commission> = {}): Commission => ({
  id: 1,
  contractId: 123,
  currency: "USD" as any,
  totalAmount: 1000,
  date: "2025-09-10",
  paymentType: "COMPLETO" as any,
  installments: 1,
  status: "PENDIENTE" as any,
  note: "nota",
  ...over,
});

describe("CommissionDialog", () => {
  it("render add: título correcto, open propagado y props del form", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();
    const item = makeCommission({ id: 10, contractId: 50 });

    render(
      <CommissionDialog open={true} contractId={50} action="add" item={item} onClose={onClose} onSaved={onSaved} />
    );

    // Modal y título
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Nueva comisión");

    // CommissionForm recibe action, item y contractId tal cual
    expect(screen.getByTestId("commission-form")).toBeInTheDocument();
    expect(screen.getByTestId("commission-form")).toHaveAttribute("data-action", "add");
    expect(screen.getByTestId("form-item").textContent).toContain('"id":10');
    expect(screen.getByTestId("form-contract").textContent).toBe("50");

    // El Modal recibió el onClose
    expect(modalCalls.at(-1).onClose).toBeTypeOf("function");
  });

  it('render edit: título correcto y action="edit"', () => {
    render(
      <CommissionDialog
        open={false}
        contractId={77}
        action="edit"
        item={makeCommission({ id: 22, contractId: 77 })}
        onClose={() => {}}
        onSaved={() => {}}
      />
    );

    // Aunque open=false, verificamos que llegue al Modal y el título sea el de edit
    expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "false");
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Editar comisión");
    expect(screen.getByTestId("commission-form")).toHaveAttribute("data-action", "edit");
  });

  it('rama default (action undefined o "delete"): usa título "Eliminar comisión"', () => {
    const { rerender } = render(
      <CommissionDialog open contractId={10} item={makeCommission({ id: 1 })} onClose={() => {}} onSaved={() => {}} />
    );
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Eliminar comisión");
    expect(screen.getByTestId("commission-form")).toHaveAttribute("data-action", "");

    // Con action="delete" también debe mostrar el mismo título
    rerender(
      <CommissionDialog
        open
        contractId={10}
        action="delete"
        item={makeCommission({ id: 2 })}
        onClose={() => {}}
        onSaved={() => {}}
      />
    );
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Eliminar comisión");
    expect(screen.getByTestId("commission-form")).toHaveAttribute("data-action", "delete");
  });

  it("convierte contractId e item null a undefined para el form", () => {
    render(
      <CommissionDialog
        open
        contractId={null as any}
        action="add"
        item={null as any}
        onClose={() => {}}
        onSaved={() => {}}
      />
    );

    expect(screen.getByTestId("form-item").textContent).toBe("");
    expect(screen.getByTestId("form-contract").textContent).toBe("");
  });

  it("al ejecutar onSuccess del form, llama onSaved y luego onClose", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    render(
      <CommissionDialog
        open
        contractId={5}
        action="add"
        item={makeCommission({ id: 99, contractId: 5 })}
        onClose={onClose}
        onSaved={onSaved}
      />
    );

    fireEvent.click(screen.getByTestId("form-success"));

    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);

    const savedIndex = (onSaved as any).mock.invocationCallOrder[0];
    const closeIndex = (onClose as any).mock.invocationCallOrder[0];
    expect(savedIndex).toBeLessThan(closeIndex);
  });

  it("el botón utilitario del Modal dispara onClose (propagado correctamente)", () => {
    const onClose = vi.fn();

    render(
      <CommissionDialog
        open
        contractId={1}
        action="edit"
        item={makeCommission({ id: 1 })}
        onClose={onClose}
        onSaved={() => {}}
      />
    );

    fireEvent.click(screen.getByTestId("modal-close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
