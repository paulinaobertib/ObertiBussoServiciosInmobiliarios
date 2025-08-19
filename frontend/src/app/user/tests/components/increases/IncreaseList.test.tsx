// src/app/user/tests/components/increases/IncreasesList.test.tsx
/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IncreasesList } from "../../../components/increases/IncreasesList";

// Mock del hijo para inspeccionar props y disparar handlers
vi.mock("../../../components/increases/IncreaseItem", () => {
  const IncreaseItem = vi.fn(({ increase, onEdit, onDelete }: any) => (
    <div data-testid={`inc-${increase.id}`}>
      <button data-testid={`edit-${increase.id}`} onClick={() => onEdit?.(increase)}>
        edit
      </button>
      <button data-testid={`del-${increase.id}`} onClick={() => onDelete?.(increase)}>
        delete
      </button>
    </div>
  ));
  return { IncreaseItem };
});

import { IncreaseItem as IncreaseItemMock } from "../../../components/increases/IncreaseItem";
const IncreaseItem = IncreaseItemMock as unknown as Mock;

describe("IncreasesList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra el placeholder cuando no hay aumentos", () => {
    render(<IncreasesList increases={[]} />);

    // Ajustá el texto si tu copy difiere
    expect(screen.getByText(/sin aumentos registrados/i)).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
    expect(IncreaseItem).not.toHaveBeenCalled();
  });

  it("renderiza un IncreaseItem por cada aumento y pasa las props", () => {
    const increases = [
      { id: 1, date: "2025-01-01T00:00:00Z", amount: 10, currency: "ARS", frequency: 12 },
      { id: 2, date: "2025-02-01T00:00:00Z", amount: 15, currency: "USD", frequency: 6 },
    ] as any[];

    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<IncreasesList increases={increases} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(IncreaseItem).toHaveBeenCalledTimes(increases.length);

    const [firstProps] = (IncreaseItem as Mock).mock.calls[0];
    const [secondProps] = (IncreaseItem as Mock).mock.calls[1];

    expect(firstProps.increase.id).toBe(1);
    expect(secondProps.increase.id).toBe(2);
    expect(firstProps.onEdit).toBe(onEdit);
    expect(firstProps.onDelete).toBe(onDelete);
  });

  it("propaga onEdit y onDelete al hacer clic en los botones de cada item", async () => {
    const user = userEvent.setup();

    const increases = [
      { id: 10, date: "2025-03-01T00:00:00Z", amount: 5, currency: "ARS", frequency: 12 },
      { id: 20, date: "2025-04-01T00:00:00Z", amount: 7, currency: "USD", frequency: 6 },
    ] as any[];

    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<IncreasesList increases={increases} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByTestId("edit-10"));
    await user.click(screen.getByTestId("del-10"));
    expect(onEdit).toHaveBeenCalledWith(increases[0]);
    expect(onDelete).toHaveBeenCalledWith(increases[0]);

    await user.click(screen.getByTestId("edit-20"));
    await user.click(screen.getByTestId("del-20"));
    expect(onEdit).toHaveBeenLastCalledWith(increases[1]);
    expect(onDelete).toHaveBeenLastCalledWith(increases[1]);
  });
});
