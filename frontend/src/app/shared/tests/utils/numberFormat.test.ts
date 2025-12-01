import { describe, it, expect } from "vitest";
import { formatAmount, formatCurrencyAmount } from "../../utils/numberFormat";

describe("numberFormat utils", () => {
  it("formatAmount normaliza números, strings e inválidos", () => {
    expect(formatAmount(12345.6)).toBe("12.345,6");
    expect(formatAmount("9876.543")).toBe("9.876,54");
    expect(formatAmount(Number.POSITIVE_INFINITY)).toBe("0");
    expect(formatAmount("abc")).toBe("0");
    expect(formatAmount()).toBe("0");
  });

  it("formatCurrencyAmount aplica prefijo según moneda", () => {
    expect(formatCurrencyAmount(1500, "USD")).toBe("USD $ 1.500");
    expect(formatCurrencyAmount("2500.5", "ARS")).toBe("ARS $ 2.500,5");
    expect(formatCurrencyAmount(null, null)).toBe("ARS $ 0");
  });
});
