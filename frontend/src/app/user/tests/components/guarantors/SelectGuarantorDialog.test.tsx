vi.mock("@mui/x-data-grid/esm/index.css", () => ({}));

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GuarantorPickerDialog } from "../../../components/guarantors/SelectGuarantorDialog";

// mock Modal
vi.mock("../../../../shared/components/Modal", () => ({
  Modal: (props: any) => (
    <div data-testid="modal" data-open={String(props.open)}>
      <h2>{props.title}</h2>
      {props.children}
    </div>
  ),
}));

// mock GuarantorsSection
vi.mock("../../../components/guarantors/GuarantorsSection", () => ({
  GuarantorsSection: (props: any) => (
    <div data-testid="guarantors-section">
      <button
        data-testid="toggle-select"
        onClick={() => props.toggleSelect?.([1, 2])} 
      >
        toggle
      </button>
    </div>
  ),
}));

// mock del service
const addGuarantorToContractMock = vi.fn().mockResolvedValue(undefined);
vi.mock("../../../services/guarantor.service", () => ({
  addGuarantorToContract: (...args: any[]) =>
    addGuarantorToContractMock(...args),
}));

describe("GuarantorPickerDialog", () => {
  it("renderiza el título correctamente cuando open=true", () => {
    render(
      <GuarantorPickerDialog open={true} contractId={1} onClose={() => {}} />
    );
    expect(screen.getByText("Seleccionar garantes")).toBeInTheDocument();
    expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "true");
  });

  it("no abre el modal cuando open=false", () => {
    render(
      <GuarantorPickerDialog open={false} contractId={1} onClose={() => {}} />
    );
    expect(screen.getByTestId("modal")).toHaveAttribute("data-open", "false");
  });

it("llama a addGuarantorToContract y onClose al seleccionar", async () => {
  const onClose = vi.fn();
  addGuarantorToContractMock.mockClear();

  render(
    <GuarantorPickerDialog
      open={true}
      contractId={55}
      onClose={onClose}
    />
  );

  fireEvent.click(screen.getByTestId("toggle-select"));

  await waitFor(() => {
    expect(addGuarantorToContractMock).toHaveBeenCalledWith(1, 55);
    expect(addGuarantorToContractMock).toHaveBeenCalledWith(2, 55);
    expect(onClose).toHaveBeenCalled();
  });
});

});
