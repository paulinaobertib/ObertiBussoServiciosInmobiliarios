import { describe, it, expect } from "vitest";
import { emptyReceipt, nextMonthCopy } from "../../utils/receiptPrefill";
import { PaymentCurrency } from "../../types/payment";
import type { ReceiptCreate } from "../../types/receipt";

const receipt = (over: Partial<ReceiptCreate> = {}): ReceiptCreate => ({
  ...emptyReceipt(),
  currency: PaymentCurrency.ARS,
  payerName: "Marianela Pirani",
  periodMonth: 12,
  periodYear: 2026,
  paymentId: 55,
  items: [
    { description: "Alquiler diciembre 2026", amount: 436255 },
    { description: "Rentas", amount: 2966.33 },
  ],
  ...over,
});

describe("nextMonthCopy", () => {
  it("pasa al mes siguiente, incluso de diciembre a enero", () => {
    const next = nextMonthCopy(receipt());
    expect(next.periodMonth).toBe(1);
    expect(next.periodYear).toBe(2027);
    expect(next.items[0].description).toBe("Alquiler enero 2027");
    expect(next.items[1]).toEqual({ description: "Rentas", amount: 2966.33 });
  });

  it("no arrastra el pago del recibo original", () => {
    expect(nextMonthCopy(receipt()).paymentId).toBeNull();
  });

  it("mantiene emisor, inquilino y montos", () => {
    const next = nextMonthCopy(receipt({ issuer: "INMOBILIARIA" }));
    expect(next.issuer).toBe("INMOBILIARIA");
    expect(next.payerName).toBe("Marianela Pirani");
    expect(next.items[0].amount).toBe(436255);
  });
});
