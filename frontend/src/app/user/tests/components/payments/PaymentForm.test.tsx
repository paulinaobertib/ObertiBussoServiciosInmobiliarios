/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";

// SUT
import { PaymentForm } from "../../../components/payments/PaymentForm";

// Tipos/enums
import { PaymentCurrency, PaymentConcept } from "../../../types/payment";

// ────────────────── Mocks de servicios usados por PaymentForm ──────────────────
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

// ───────────────────────────── Helpers de test ─────────────────────────────
const lastOnChange = (mock: any) => {
  const c = mock.mock.calls;
  return c[c.length - 1][0];
};

const typeInto = async (label: RegExp, value: string) => {
  const input = screen.queryByLabelText(label) ?? screen.getByRole("textbox", { name: label });
  // limpiar y escribir (maneja inputs number/text)
  await userEvent.clear(input as HTMLElement);
  if (value) {
    await userEvent.type(input as HTMLElement, value);
  }
};

const openSelect = async (label: RegExp) => {
  // Muchos MUI Selects son "combobox"; a veces se exponen como "button"
  let trigger: HTMLElement | null = null;
  try {
    trigger = await screen.findByRole("combobox", { name: label }, { timeout: 8000 });
  } catch {
    trigger = await screen.findByRole("button", { name: label }, { timeout: 8000 });
  }
  await userEvent.click(trigger!);
};

const chooseOption = async (label: RegExp) => {
  const opt = await screen.findByRole("option", { name: label }, { timeout: 8000 });
  await userEvent.click(opt);
};

// ───────────────────────────── Fixtures ─────────────────────────────
const utilsList = [
  { id: 1, utilityId: 101 }, // este lo nombraremos "Luz"
  { id: 2, utilityId: 202 }, // este segundo forzaremos un error de nombre
];

const utilityNames: Record<number, string> = {
  101: "Luz",
  202: "Agua",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PaymentForm", () => {
  it(
    "fetch OK: carga utilidades y comisión; maneja cambios de campos y reseteos por concepto",
    async () => {
      const onChange = vi.fn();

      // getContractUtilities: OK
      (getContractUtilitiesByContract as any).mockResolvedValueOnce(utilsList);
      // getUtilityById: mezcla OK / error para cubrir el catch interno
      (getUtilityById as any)
        .mockResolvedValueOnce({ id: 101, name: utilityNames[101] }) // "Luz"
        .mockRejectedValueOnce(new Error("no-name")); // el segundo nombre falla
      // comisión OK
      (getCommissionByContractId as any).mockResolvedValueOnce({ id: 77 });

      render(<PaymentForm contractId={42} onChange={onChange} />);

      // onChange se dispara al mount con valores iniciales
      await waitFor(() => expect(onChange).toHaveBeenCalled(), { timeout: 10000 });

      // Esperamos a que termine el fetch de comisión/utilidades
      await waitFor(
        () => {
          expect(getContractUtilitiesByContract).toHaveBeenCalledWith(42);
          expect(getCommissionByContractId).toHaveBeenCalledWith(42);
        },
        { timeout: 10000 }
      );

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

      // Buscar el control accesible del selector de "Servicio del contrato"
      // (MUI Select suele ser 'combobox'; a veces 'button' según la variante)
      let serviceTrigger: HTMLElement;
      try {
        serviceTrigger = await screen.findByRole("combobox", { name: /Servicio del contrato/i }, { timeout: 8000 });
      } catch {
        serviceTrigger = await screen.findByRole("button", { name: /Servicio del contrato/i }, { timeout: 8000 });
      }
      expect(serviceTrigger).toBeInTheDocument();

      // Abrimos el selector y elegimos "Luz"
      await userEvent.click(serviceTrigger);
      const luzOpt = await screen.findByRole("option", { name: /luz/i }, { timeout: 8000 });
      await userEvent.click(luzOpt);
      expect(lastOnChange(onChange).contractUtilityId).toBe(1); // id con utilityId=101 ("Luz")

      // Concepto -> COMISION (limpia contractUtilityId y mantiene commissionId=77)
      await openSelect(/Concepto/i);
      await chooseOption(/comision/i);
      const afterComision = lastOnChange(onChange);
      expect(afterComision.concept).toBe(PaymentConcept.COMISION);
      expect(afterComision.contractUtilityId).toBe(""); // limpiado

      // la comisión debería mostrarse (campo deshabilitado con el texto)
      expect(await screen.findByDisplayValue(/Comisión #77/i, {}, { timeout: 8000 })).toBeDisabled();

      // Cambiar a otra moneda para asegurar que el select sigue operativo
      await openSelect(/Moneda/i);
      await chooseOption(/Peso argentino/i);
      expect(lastOnChange(onChange).paymentCurrency).toBe(PaymentCurrency.ARS);
    },
    { timeout: 20000 } // ← margen extra para ejecución con coverage
  );

  it("aplica externalConcept y externalContractUtilityId al cambiar props", async () => {
    const onChange = vi.fn();

    // Evitamos fetches acá para centrarnos en los external*
    (getContractUtilitiesByContract as any).mockResolvedValue([]);
    (getCommissionByContractId as any).mockResolvedValue({ id: 11 });

    const { rerender } = render(<PaymentForm contractId={10} onChange={onChange} />);

    // Aplico concept externo
    rerender(<PaymentForm contractId={10} onChange={onChange} externalConcept={PaymentConcept.EXTRA} />);
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
    expect(await screen.findByText(/No hay comisión asociada a este contrato\./i)).toBeInTheDocument();

    // concept -> EXTRA: aparece selector de servicio aunque no haya opciones (lista vacía)
    await openSelect(/Concepto/i);
    await chooseOption(/extra/i);
    expect(await screen.findByRole("combobox", { name: /Servicio del contrato/i })).toBeInTheDocument();

    // Además, al elegir EXTRA, commissionId debe limpiarse
    expect(lastOnChange(onChange).commissionId).toBe("");
  });
});
