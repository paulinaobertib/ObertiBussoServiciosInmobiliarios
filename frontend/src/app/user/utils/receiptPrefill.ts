import dayjs from "dayjs";
import { getUserById } from "../services/user.service";
import { getPropertyById } from "../../property/services/property.service";
import { getOwnerByPropertyId } from "../../property/services/owner.service";
import type { Contract, ContractGet } from "../types/contract";
import { PaymentConcept, PaymentCurrency, type Payment } from "../types/payment";
import { MONTHS, type Receipt, type ReceiptCreate, type ReceiptIssuer } from "../types/receipt";

const ISSUER_KEY = "receipts:lastIssuer";

export const rememberedIssuer = (): ReceiptIssuer => {
  try {
    const v = localStorage.getItem(ISSUER_KEY);
    return v === "INMOBILIARIA" || v === "CORREDOR" ? v : "CORREDOR";
  } catch {
    return "CORREDOR";
  }
};

export const rememberIssuer = (issuer: ReceiptIssuer) => {
  try {
    localStorage.setItem(ISSUER_KEY, issuer);
  } catch {
    // sin storage no pasa nada: se usa el valor por defecto
  }
};

export const emptyReceipt = (): ReceiptCreate => {
  const today = dayjs();
  return {
    issuer: rememberedIssuer(),
    kind: "RECIBO",
    concept: "ALQUILER",
    issueDate: today.format("YYYY-MM-DD"),
    periodMonth: today.month() + 1,
    periodYear: today.year(),
    currency: PaymentCurrency.ARS,
    payerName: "",
    payerDni: null,
    ownerName: null,
    propertyAddress: null,
    notes: null,
    userId: null,
    contractId: null,
    paymentId: null,
    items: [{ description: `Alquiler ${MONTHS[today.month()].toLowerCase()} ${today.year()}`, amount: 0 }],
  };
};

const settled = async <T,>(p: Promise<T>): Promise<T | null> => {
  try {
    return await p;
  } catch {
    return null;
  }
};

/** Arma un recibo a partir de un contrato (y opcionalmente de un pago ya registrado) */
export async function receiptFromContract(
  contract: Contract | ContractGet,
  payment?: Payment | null,
  utilityName?: string | null
): Promise<ReceiptCreate> {
  const base = emptyReceipt();
  const [userResp, property, owner] = await Promise.all([
    settled(getUserById(contract.userId)),
    contract.propertyId ? settled(getPropertyById(contract.propertyId)) : Promise.resolve(null),
    contract.propertyId ? settled(getOwnerByPropertyId(contract.propertyId)) : Promise.resolve(null),
  ]);
  const user: any = (userResp as any)?.data ?? userResp;
  const prop: any = property;

  const address = prop
    ? [`${prop.street ?? ""} ${prop.number ?? ""}`.trim(), prop.neighborhood?.name, prop.neighborhood?.city]
        .filter(Boolean)
        .join(", ")
    : null;

  const when = payment?.date ? dayjs(payment.date) : dayjs();
  const periodLabel = `${MONTHS[when.month()].toLowerCase()} ${when.year()}`;

  let concept: ReceiptCreate["concept"] = "ALQUILER";
  let description = `Alquiler ${periodLabel}`;
  let amount = Number(contract.lastPaidAmount ?? contract.initialAmount ?? 0);
  if (payment) {
    amount = Number(payment.amount);
    if (payment.concept === PaymentConcept.EXTRA) {
      const name = utilityName || payment.description || "Servicio";
      concept = /expensa/i.test(name) ? "EXPENSAS" : "SERVICIOS";
      description = `${name} ${periodLabel}`;
    } else if (payment.concept === PaymentConcept.COMISION) {
      concept = "OTRO";
      description = payment.description || "Honorarios / comisión inmobiliaria";
    } else if (payment.description) {
      description = payment.description;
    }
  }

  return {
    ...base,
    concept,
    periodMonth: when.month() + 1,
    periodYear: when.year(),
    currency: (payment?.paymentCurrency ?? contract.currency ?? PaymentCurrency.ARS) as PaymentCurrency,
    payerName: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "",
    ownerName: owner ? `${(owner as any).firstName ?? ""} ${(owner as any).lastName ?? ""}`.trim() || null : null,
    propertyAddress: address || null,
    userId: contract.userId,
    contractId: contract.id,
    paymentId: payment?.id ?? null,
    items: [{ description, amount }],
  };
}

/** Los datos editables de un recibo ya emitido */
export const receiptToCreate = (r: Receipt): ReceiptCreate => ({
  issuer: r.issuer,
  kind: r.kind,
  concept: r.concept,
  issueDate: r.issueDate,
  periodMonth: r.periodMonth,
  periodYear: r.periodYear,
  currency: r.currency,
  payerName: r.payerName,
  payerDni: r.payerDni,
  ownerName: r.ownerName,
  propertyAddress: r.propertyAddress,
  notes: r.notes,
  userId: r.userId,
  contractId: r.contractId,
  paymentId: r.paymentId,
  items: r.items.map((i) => ({ ...i })),
});

/** Copia un recibo para el período siguiente (el caso típico de todos los meses) */
export function nextMonthCopy(r: ReceiptCreate): ReceiptCreate {
  const month = r.periodMonth ?? dayjs().month() + 1;
  const year = r.periodYear ?? dayjs().year();
  const next = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).add(1, "month");
  const oldLabel = `${MONTHS[month - 1].toLowerCase()} ${year}`;
  const newLabel = `${MONTHS[next.month()].toLowerCase()} ${next.year()}`;
  return {
    ...r,
    issueDate: dayjs().format("YYYY-MM-DD"),
    periodMonth: next.month() + 1,
    periodYear: next.year(),
    paymentId: null,
    items: r.items.map((i) => ({ ...i, description: i.description.replace(new RegExp(oldLabel, "i"), newLabel) })),
  };
}
