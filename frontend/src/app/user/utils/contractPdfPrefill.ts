import type { ContractFormValues } from "../hooks/contracts/useContractForm";
import type { ContractExtraction, ContractExtraField, ExtractedPerson } from "../types/contractPdf";
import { ContractStatus } from "../types/contract";

// campos del formulario de contrato que se pueden completar desde el PDF
export type PrefillableField =
  | "contractType"
  | "startDate"
  | "endDate"
  | "currency"
  | "initialAmount"
  | "adjustmentIndexId"
  | "adjustmentFrequencyMonths";

export interface ContractPrefill {
  values: Partial<ContractFormValues>;
  /** campos obligatorios que el contrato no trae: hay que completarlos a mano */
  missing: PrefillableField[];
}

export function buildContractPrefill(x: ContractExtraction, adjustmentIndexId: number | null): ContractPrefill {
  const values: Partial<ContractFormValues> = { contractStatus: ContractStatus.ACTIVO };
  const missing: PrefillableField[] = [];

  const put = <K extends PrefillableField>(key: K, value: ContractFormValues[K] | null | undefined) => {
    if (value === null || value === undefined || value === "") missing.push(key);
    else values[key] = value;
  };

  put("contractType", x.contractType ?? null);
  put("startDate", x.startDate ?? null);
  put("endDate", x.endDate ?? null);
  put("currency", x.currency ?? null);
  put("initialAmount", x.initialAmount != null && x.initialAmount > 0 ? Number(x.initialAmount) : null);
  put("adjustmentIndexId", adjustmentIndexId);
  put("adjustmentFrequencyMonths", x.adjustmentFrequencyMonths && x.adjustmentFrequencyMonths > 0 ? x.adjustmentFrequencyMonths : null);

  if (x.hasDeposit) {
    values.hasDeposit = true;
    values.depositAmount = x.depositAmount ?? "";
    values.depositNote = x.depositNote ?? "";
  }
  return { values, missing };
}

const personLine = (p: ExtractedPerson) =>
  [p.fullName, p.dni && `DNI ${p.dni}`, p.phone && `Tel. ${p.phone}`, p.email, p.address].filter(Boolean).join(" · ");

/**
 * Datos del PDF que el sistema no guarda en otro lado: se suman a "Otros datos del contrato"
 * para no perder nada (DNI del inquilino, locador, servicios, garantes que no se cargaron).
 */
export function derivedExtraFields(
  x: ContractExtraction,
  opts: { unlinkedGuarantors: ExtractedPerson[]; indexText?: string | null; indexLinked: boolean }
): ContractExtraField[] {
  const out: ContractExtraField[] = [];
  if (x.tenant && (x.tenant.dni || x.tenant.address)) {
    out.push({ label: "Locatario (según contrato)", value: personLine(x.tenant) });
  }
  if (x.owner?.fullName) out.push({ label: "Locador (según contrato)", value: personLine(x.owner) });
  if (x.property?.address) {
    out.push({ label: "Inmueble (según contrato)", value: [x.property.address, x.property.city].filter(Boolean).join(", ") });
  }
  if (x.utilities.length) out.push({ label: "Servicios a cargo del inquilino", value: x.utilities.join(", ") });
  opts.unlinkedGuarantors.forEach((g, i) =>
    out.push({ label: opts.unlinkedGuarantors.length > 1 ? `Garante ${i + 1}` : "Garante", value: personLine(g) })
  );
  if (opts.indexText && !opts.indexLinked) out.push({ label: "Ajuste según contrato", value: opts.indexText });
  return out;
}
