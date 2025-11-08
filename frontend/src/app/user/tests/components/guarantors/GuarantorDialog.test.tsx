/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { GuarantorDialog } from "../../../components/guarantors/GuarantorDialog";

const MockModal = vi.fn(({ open, title, children }: any) =>
  open ? (
    <div data-testid="modal">
      <h2>{title}</h2>
      {children}
    </div>
  ) : null
);

const MockGuarantorForm = vi.fn(({ action, item, onSuccess }: any) => (
  <div data-testid="guarantor-form">
    <span>Action: {action}</span>
    <span>Item: {item?.name ?? "none"}</span>
    <button onClick={onSuccess}>TriggerSuccess</button>
  </div>
));

vi.mock("../../../shared/components/Modal", () => ({
  Modal: (props: any) => MockModal(props),
}));

// 👇 importante: default export porque GuarantorForm es default
vi.mock("../../../components/guarantors/GuarantorForm", () => ({
  default: (props: any) => MockGuarantorForm(props),
}));

/* ========== Fixtures ========== */
const guarantor = { id: 1, name: "Juan Pérez", phone: "123", email: "test@mail.com" };

/* ========== Tests ========== */
describe("GuarantorDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza con título correcto en modo add", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    render(<GuarantorDialog open={true} mode="add" item={guarantor} onClose={onClose} onSaved={onSaved} />);

    expect(screen.getByText("Crear garante")).toBeInTheDocument();
    expect(MockGuarantorForm).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "add",
        item: guarantor,
        onSuccess: onSaved,
      })
    );
  });

  it("renderiza con título correcto en modo edit", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    render(<GuarantorDialog open={true} mode="edit" item={guarantor} onClose={onClose} onSaved={onSaved} />);

    expect(screen.getByText("Editar garante")).toBeInTheDocument();
    expect(MockGuarantorForm).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "edit",
        item: guarantor,
        onSuccess: onSaved,
      })
    );
  });

  it("renderiza con título correcto en modo delete", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    render(<GuarantorDialog open={true} mode="delete" item={guarantor} onClose={onClose} onSaved={onSaved} />);

    expect(screen.getByText("Eliminar garante")).toBeInTheDocument();
    expect(MockGuarantorForm).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "delete",
        item: guarantor,
        onSuccess: onSaved,
      })
    );
  });

  it("no renderiza nada si open=false", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    const { container } = render(
      <GuarantorDialog open={false} mode="add" item={guarantor} onClose={onClose} onSaved={onSaved} />
    );

    expect(container).toBeEmptyDOMElement();
    expect(MockModal).not.toHaveBeenCalled();
    expect(MockGuarantorForm).not.toHaveBeenCalled();
  });

  it("llama onSaved desde GuarantorForm", () => {
    const onClose = vi.fn();
    const onSaved = vi.fn();

    render(<GuarantorDialog open={true} mode="add" item={guarantor} onClose={onClose} onSaved={onSaved} />);

    screen.getByText("TriggerSuccess").click();
    expect(onSaved).toHaveBeenCalledTimes(1);
  });
});
