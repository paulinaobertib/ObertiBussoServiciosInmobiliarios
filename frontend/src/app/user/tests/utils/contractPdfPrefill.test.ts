import { describe, it, expect } from "vitest";
import { buildContractPrefill, derivedExtraFields } from "../../utils/contractPdfPrefill";
import type { ContractExtraction } from "../../types/contractPdf";
import { ContractType } from "../../types/contract";
import { PaymentCurrency } from "../../types/payment";

const base = (): ContractExtraction => ({
  tenant: { fullName: "Marianela Pirani", dni: "30.111.222", email: null, phone: null, address: null },
  owner: { fullName: "Silvina Quintana", dni: null, email: null, phone: null, address: null },
  property: { address: "9 de Julio 3225", city: "Córdoba", description: null },
  contractType: ContractType.VIVIENDA,
  startDate: "2025-03-01",
  endDate: "2028-02-29",
  durationMonths: 36,
  currency: PaymentCurrency.ARS,
  initialAmount: 350000,
  adjustmentIndex: "ICL",
  adjustmentFrequencyMonths: 6,
  hasDeposit: true,
  depositAmount: 350000,
  depositNote: null,
  guarantors: [],
  utilities: ["Luz", "Gas"],
  extraFields: [],
  warnings: [],
  missingFields: [],
  source: "TEXT",
});

describe("buildContractPrefill", () => {
  it("completa el formulario con lo que trae el contrato", () => {
    const { values, missing } = buildContractPrefill(base(), 4);
    expect(missing).toEqual([]);
    expect(values).toMatchObject({
      contractType: "VIVIENDA",
      contractStatus: "ACTIVO",
      startDate: "2025-03-01",
      initialAmount: 350000,
      adjustmentIndexId: 4,
      adjustmentFrequencyMonths: 6,
      hasDeposit: true,
      depositAmount: 350000,
    });
  });

  it("marca lo que falta en vez de inventarlo", () => {
    const x = { ...base(), endDate: null, initialAmount: 0, currency: null, adjustmentFrequencyMonths: null };
    const { values, missing } = buildContractPrefill(x, null);
    expect(missing).toEqual(["endDate", "currency", "initialAmount", "adjustmentIndexId", "adjustmentFrequencyMonths"]);
    expect(values.endDate).toBeUndefined();
    expect(values.initialAmount).toBeUndefined();
  });
});

describe("derivedExtraFields", () => {
  it("guarda lo que no tiene lugar en el formulario", () => {
    const fields = derivedExtraFields(
      { ...base(), guarantors: [] },
      {
        unlinkedGuarantors: [{ fullName: "Juan Pérez", dni: "20.333.444", email: null, phone: "351 555", address: null }],
        indexText: "ICL",
        indexLinked: false,
      }
    );
    const labels = fields.map((f) => f.label);
    expect(labels).toEqual([
      "Locatario (según contrato)",
      "Locador (según contrato)",
      "Inmueble (según contrato)",
      "Servicios a cargo del inquilino",
      "Garante",
      "Ajuste según contrato",
    ]);
    expect(fields[4].value).toBe("Juan Pérez · DNI 20.333.444 · Tel. 351 555");
  });
});
