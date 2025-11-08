import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import {
  ContractUtilityForm,
  type ContractUtilityFormHandle,
} from "../../../components/contract-utilities/ContractUtilityForm";
import { UtilityPeriodicityPayment } from "../../../types/contractUtility";
import React from "react";

describe("ContractUtilityForm", () => {
  const utility = { id: 10, name: "Gas" } as any;
  const contractId = 55;

  let ref: React.RefObject<ContractUtilityFormHandle | null>;

  beforeEach(() => {
    ref = React.createRef<ContractUtilityFormHandle>();
  });

  it("renderiza con valores iniciales por defecto", () => {
    render(<ContractUtilityForm ref={ref} utility={utility} contractId={contractId} />);
    // buscar el input oculto que contiene el valor
    expect(screen.getByDisplayValue(UtilityPeriodicityPayment.MENSUAL)).toBeInTheDocument();

    expect(screen.getByLabelText("Monto inicial")).toHaveValue(0);
    expect(screen.getByLabelText("Notas")).toHaveValue("");
  });

  it("renderiza con valores iniciales dados", () => {
    render(
      <ContractUtilityForm
        ref={ref}
        utility={utility}
        contractId={contractId}
        initial={{ periodicity: UtilityPeriodicityPayment.ANUAL, initialAmount: 123, notes: "abc" }}
      />
    );

    expect(screen.getByDisplayValue(UtilityPeriodicityPayment.ANUAL)).toBeInTheDocument();

    expect(screen.getByLabelText("Monto inicial")).toHaveValue(123);
    expect(screen.getByLabelText("Notas")).toHaveValue("abc");
  });

  it("cambia la periodicidad", () => {
    render(<ContractUtilityForm ref={ref} utility={utility} contractId={contractId} />);
    const select = screen.getByRole("combobox", { name: "Periodicidad" });

    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByRole("option", { name: /Trimestral/i }));

    expect(screen.getByDisplayValue(UtilityPeriodicityPayment.TRIMESTRAL)).toBeInTheDocument();
  });

  it("cambia el monto inicial", () => {
    render(<ContractUtilityForm ref={ref} utility={utility} contractId={contractId} />);
    const amount = screen.getByLabelText("Monto inicial");

    fireEvent.change(amount, { target: { value: "456" } });
    expect(amount).toHaveValue(456);

    fireEvent.change(amount, { target: { value: "" } });
    expect(amount).toHaveValue(null); // input vacío se vuelve null
  });

  it("cambia las notas", () => {
    render(<ContractUtilityForm ref={ref} utility={utility} contractId={contractId} />);
    const notes = screen.getByLabelText("Notas");

    fireEvent.change(notes, { target: { value: "hello" } });
    expect(notes).toHaveValue("hello");
  });

  it("getData devuelve los valores correctos", () => {
    render(
      <ContractUtilityForm
        ref={ref}
        utility={utility}
        contractId={contractId}
        initial={{ periodicity: UtilityPeriodicityPayment.TRIMESTRAL, initialAmount: 999, notes: "note" }}
      />
    );

    const data = ref.current!.getData();
    expect(data).toEqual(
      expect.objectContaining({
        periodicity: UtilityPeriodicityPayment.TRIMESTRAL,
        initialAmount: 999,
        notes: "note",
        contractId,
        utilityId: utility.id,
      })
    );
  });

  it("renderiza todas las opciones de periodicidad con labelize aplicado", () => {
    render(<ContractUtilityForm ref={ref} utility={utility} contractId={contractId} />);
    const select = screen.getByRole("combobox", { name: "Periodicidad" });

    fireEvent.mouseDown(select);
    const listbox = screen.getByRole("listbox");

    Object.values(UtilityPeriodicityPayment).forEach((p) => {
      const label = p.charAt(0) + p.slice(1).toLowerCase();
      expect(within(listbox).getByText(label)).toBeInTheDocument();
    });
  });
});
