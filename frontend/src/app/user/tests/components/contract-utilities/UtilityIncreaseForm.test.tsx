import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UtilityIncreaseForm } from "../../../components/contract-utilities/UtilityIncreaseForm";

describe("UtilityIncreaseForm", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza con initialValues y llama a onChange al montar", () => {
    render(
      <UtilityIncreaseForm
        initialValues={{ adjustmentDate: "2025-01-01", amount: 50 }}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText("Fecha desde que regirá")).toHaveValue("2025-01-01");
    expect(screen.getByLabelText("Nuevo monto")).toHaveValue(50);

    expect(mockOnChange).toHaveBeenCalledWith({
      adjustmentDate: "2025-01-01",
      amount: 50,
    });
  });

  it("actualiza adjustmentDate y dispara onChange", () => {
    render(<UtilityIncreaseForm onChange={mockOnChange} />);
    const dateInput = screen.getByLabelText("Fecha desde que regirá");

    fireEvent.change(dateInput, { target: { value: "2025-02-02" } });

    expect(dateInput).toHaveValue("2025-02-02");
    expect(mockOnChange).toHaveBeenLastCalledWith({
      adjustmentDate: "2025-02-02",
      amount: "",
    });
  });

  it("actualiza amount con número y dispara onChange", () => {
    render(<UtilityIncreaseForm onChange={mockOnChange} />);
    const amountInput = screen.getByLabelText("Nuevo monto");

    fireEvent.change(amountInput, { target: { value: "123" } });

    expect(amountInput).toHaveValue(123);
    expect(mockOnChange).toHaveBeenLastCalledWith({
      adjustmentDate: "",
      amount: 123,
    });
  });

  it("guarda amount como string vacío si se borra el valor", () => {
    render(<UtilityIncreaseForm onChange={mockOnChange} />);
    const amountInput = screen.getByLabelText("Nuevo monto");

    fireEvent.change(amountInput, { target: { value: "" } });

    expect(amountInput).toHaveValue(null); 
    expect(mockOnChange).toHaveBeenLastCalledWith({
      adjustmentDate: "",
      amount: "",
    });
  });
});
