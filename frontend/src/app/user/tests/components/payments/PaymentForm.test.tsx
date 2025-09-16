/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { PaymentForm } from "../../../components/payments/PaymentForm";
import { PaymentCurrency, PaymentConcept } from "../../../types/payment";

/* =============== Mocks de servicios =============== */
vi.mock("../../../services/contractUtility.service", () => ({
  getContractUtilitiesByContract: vi.fn(),
}));
vi.mock("../../../services/utility.service", () => ({
  getUtilityById: vi.fn(),
}));
vi.mock("../../../services/commission.service", () => ({
  getCommissionByContractId: vi.fn(),
}));

import { getContractUtilitiesByContract } from "../../../services/contractUtility.service";
import { getUtilityById } from "../../../services/utility.service";
import { getCommissionByContractId } from "../../../services/commission.service";

/* =============== Helpers =============== */
const openSelect = async (label: string | RegExp) => {
  const user = userEvent.setup();
  const combo = screen.getByRole("combobox", { name: label });
  await user.click(combo);
  return combo;
};

const chooseOption = async (text: string | RegExp) => {
  const user = userEvent.setup();
  const opt = await screen.findByRole("option", { name: text });
  await user.click(opt);
};

const typeInto = async (label: string | RegExp, value: string) => {
  const user = userEvent.setup();
  const input = screen.getByLabelText(label) as HTMLInputElement | HTMLTextAreaElement;
  await user.clear(input);
  if (value !== "") await user.type(input, value);
  return input;
};

const lastOnChange = (mock: any) => mock.mock.calls[mock.mock.calls.length - 1]?.[0];

/* =============== Datos de utilidades y comisión =============== */
const utilsList = [
  { id: 1, contractId: 42, utilityId: 101 },
  { id: 2, contractId: 42, utilityId: 202 },
];

const utilityNames: Record<number, string> = {
  101: "Luz",
  202: "Agua",
};

/* =============== Tests =============== */
describe("PaymentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetch OK: carga utilidades y comisión; maneja cambios de campos y reseteos por concepto", async () => {
    const onChange = vi.fn();

    // getContractUtilities: OK
    (getContractUtilitiesByContract as any).mockResolvedValueOnce(utilsList);
    // getUtilityById: mezcla OK / error para cubrir el catch interno
    (getUtilityById as any)
      .mockResolvedValueOnce({ id: 101, name: utilityNames[101] })
      .mockRejectedValueOnce(new Error("no-name")); // -> debería ignorarlo y usar id como string si hiciera falta
    // comisión OK
    (getCommissionByContractId as any).mockResolvedValueOnce({ id: 77 });

    render(<PaymentForm contractId={42} onChange={onChange} />);

    // onChange se dispara al mount con valores iniciales
    expect(onChange).toHaveBeenCalled();

    // Esperamos a que termine el fetch de comisión para que setee commissionId en vals
    await waitFor(() => {
      expect(getContractUtilitiesByContract).toHaveBeenCalledWith(42);
      expect(getCommissionByContractId).toHaveBeenCalledWith(42);
    });

    // Cambiar fecha
    await typeInto(/Fecha/i, "2025-09-01");
    expect(lastOnChange(onChange).date).toBe("2025-09-01");

    // Cambiar descripción
    await typeInto(/Descripción/i, "Pago parcial");
    expect(lastOnChange(onChange).description).toBe("Pago parcial");

    // Monto -> número
    await typeInto(/Monto/i, "1234");
    expect(lastOnChange(onChange).amount).toBe(1234);

    // Limpiar monto -> ""
    await typeInto(/Monto/i, "");
    expect(lastOnChange(onChange).amount).toBe("");

    // Moneda -> USD
    await openSelect(/Moneda/i);
    await chooseOption(/Dólar/i);
    expect(lastOnChange(onChange).paymentCurrency).toBe(PaymentCurrency.USD);

    // Concepto -> EXTRA (debe limpiar commissionId y mostrar selector de servicio)
    await openSelect(/Concepto/i);
    await chooseOption(/extra/i);
    const afterExtra = lastOnChange(onChange);
    expect(afterExtra.concept).toBe(PaymentConcept.EXTRA);
    expect(afterExtra.commissionId).toBe(""); // limpiado
    // aparece el select de "Servicio del contrato"
    const serviceCombo = await screen.findByRole("combobox", { name: /Servicio del contrato/i });
    expect(serviceCombo).toBeInTheDocument();

    // Abrimos servicio y elegimos una opción (la 2 con nombre "Agua" podría no tener nombre por el reject; al menos 1 sí tiene "Luz")
    await userEvent.click(serviceCombo);
    // deberían aparecer al menos "Luz" y quizá otra sin nombre, pero elegimos "Luz" que sí resolvimos
    const luzOpt = await screen.findByRole("option", { name: /luz/i });
    await userEvent.click(luzOpt);
    expect(lastOnChange(onChange).contractUtilityId).toBe(1); // id del item con utilityId=101 ("Luz") es 1

    // Concepto -> COMISION (debe limpiar contractUtilityId y mantener commissionId=77)
    await openSelect(/Concepto/i);
    await chooseOption(/comision/i);
    const afterComision = lastOnChange(onChange);
    expect(afterComision.concept).toBe(PaymentConcept.COMISION);
    expect(afterComision.contractUtilityId).toBe(""); // limpiado
    // la comisión debería mostrarse
    expect(await screen.findByDisplayValue(/Comisión #77/i)).toBeDisabled();

    // Cambiar a otra moneda para asegurar que el select sigue operativo
    await openSelect(/Moneda/i);
    await chooseOption(/Peso argentino/i);
    expect(lastOnChange(onChange).paymentCurrency).toBe(PaymentCurrency.ARS);
  });

  it("aplica externalConcept y externalContractUtilityId al cambiar props", async () => {
    const onChange = vi.fn();

    // Evitamos fetches acá para centrarnos en los external*
    (getContractUtilitiesByContract as any).mockResolvedValue([]);
    (getCommissionByContractId as any).mockResolvedValue({ id: 11 });

    const { rerender } = render(
      <PaymentForm contractId={10} onChange={onChange} />
    );

    // Aplico concept externo
    rerender(
      <PaymentForm
        contractId={10}
        onChange={onChange}
        externalConcept={PaymentConcept.EXTRA}
      />
    );
    await waitFor(() => {
      expect(lastOnChange(onChange).concept).toBe(PaymentConcept.EXTRA);
    });

    // Aplico contractUtilityId externo
    rerender(
      <PaymentForm
        contractId={10}
        onChange={onChange}
        externalConcept={PaymentConcept.EXTRA}
        externalContractUtilityId={999}
      />
    );
    await waitFor(() => {
      expect(lastOnChange(onChange).contractUtilityId).toBe(999);
    });
  });

  it("contractId inválido (0): evita cualquier fetch", async () => {
    const onChange = vi.fn();

    render(<PaymentForm contractId={0} onChange={onChange} />);

    // Concepto existe (no hide) pero no debe haber fetch alguno
    expect(getContractUtilitiesByContract).not.toHaveBeenCalled();
    expect(getCommissionByContractId).not.toHaveBeenCalled();
  });

  it("fetch con errores: utilidades y comisión fallan; muestra texto de 'No hay comisión...' y render de servicio vacío", async () => {
    const onChange = vi.fn();

    (getContractUtilitiesByContract as any).mockRejectedValueOnce(new Error("fail utils"));
    (getCommissionByContractId as any).mockRejectedValueOnce(new Error("fail com"));

    render(<PaymentForm contractId={77} onChange={onChange} />);

    // Esperar a que intente
    await waitFor(() => {
      expect(getContractUtilitiesByContract).toHaveBeenCalledWith(77);
      expect(getCommissionByContractId).toHaveBeenCalledWith(77);
    });

    // concept -> COMISION: debe mostrar mensaje (no hay comisión)
    await openSelect(/Concepto/i);
    await chooseOption(/comision/i);
    expect(
      await screen.findByText(/No hay comisión asociada a este contrato\./i)
    ).toBeInTheDocument();

    // concept -> EXTRA: aparece selector de servicio aunque no haya opciones (lista vacía)
    await openSelect(/Concepto/i);
    await chooseOption(/extra/i);
    expect(
      await screen.findByRole("combobox", { name: /Servicio del contrato/i })
    ).toBeInTheDocument();

    // Además, al elegir EXTRA, commissionId debe limpiarse
    expect(lastOnChange(onChange).commissionId).toBe("");
  });
});
