/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { PaymentsList } from "../../../components/payments/PaymentsList";

vi.mock("../../../components/payments/PaymentItem", () => {
  const PaymentItem = vi.fn(
    ({ payment, onEdit, onDelete }: ComponentProps<any>) => (
      <div data-testid={`payment-item-${payment.id}`}>
        <button
          data-testid={`edit-${payment.id}`}
          onClick={() => onEdit?.(payment)}
        >
          edit
        </button>
        <button
          data-testid={`delete-${payment.id}`}
          onClick={() => onDelete?.(payment)}
        >
          delete
        </button>
      </div>
    )
  );
  return { PaymentItem };
});

import { PaymentItem as PaymentItemMock } from "../../../components/payments/PaymentItem";
const PaymentItem = PaymentItemMock as unknown as Mock;

describe("PaymentsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el placeholder cuando no hay pagos", () => {
    render(<PaymentsList payments={[]} />);

    expect(screen.getByText("Sin pagos registrados")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
    expect(PaymentItem).not.toHaveBeenCalled();
  });

  it("renderiza una List y un PaymentItem por cada pago", () => {
    const payments = [
      { id: 1, amount: 100, description: "pago A" } as any,
      { id: 2, amount: 200, description: "pago B" } as any,
    ];
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<PaymentsList payments={payments} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(PaymentItem).toHaveBeenCalledTimes(payments.length);

    const [firstArgs] = (PaymentItem as Mock).mock.calls[0];
    const [secondArgs] = (PaymentItem as Mock).mock.calls[1];

    expect(firstArgs.payment.id).toBe(1);
    expect(secondArgs.payment.id).toBe(2);
    expect(firstArgs.onEdit).toBe(onEdit);
    expect(firstArgs.onDelete).toBe(onDelete);
  });

  it("propaga onEdit y onDelete cuando se hace clic en los botones del item", async () => {
    const user = userEvent.setup();
    const payments = [
      { id: 10, amount: 500, description: "pago X" } as any,
      { id: 20, amount: 700, description: "pago Y" } as any,
    ];
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<PaymentsList payments={payments} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByTestId("edit-10"));
    await user.click(screen.getByTestId("delete-10"));
    expect(onEdit).toHaveBeenCalledWith(payments[0]);
    expect(onDelete).toHaveBeenCalledWith(payments[0]);

    await user.click(screen.getByTestId("edit-20"));
    await user.click(screen.getByTestId("delete-20"));
    expect(onEdit).toHaveBeenLastCalledWith(payments[1]);
    expect(onDelete).toHaveBeenLastCalledWith(payments[1]);
  });
});
