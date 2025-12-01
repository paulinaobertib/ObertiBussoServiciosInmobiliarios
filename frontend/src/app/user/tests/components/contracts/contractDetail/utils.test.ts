import { describe, it, expect } from "vitest";
import {
  fmtDate,
  fmtLongDate,
  currencyLabel,
  currencyPrefix,
  fmtMoney,
  typeLabel,
  periodicityLabel,
  getTime,
} from "../../../../components/contracts/contractDetail/utils";

describe("contract detail utils", () => {
  it("fmtDate maneja valores vacíos y fechas sin desfase horario", () => {
    expect(fmtDate(null)).toBe("-");
    const expected = new Date(2024, 2, 5).toLocaleDateString("es-AR");
    expect(fmtDate("2024-03-05")).toBe(expected);
  });

  it("fmtLongDate capitaliza el mes y fmtMoney aplica prefijos", () => {
    expect(fmtLongDate("2024-01-15")).toBe("15 de Enero del 2024");
    expect(currencyLabel("USD")).toBe("USD");
    expect(currencyLabel(undefined)).toBe("ARS");
    expect(currencyPrefix("USD")).toBe("USD $ ");
    expect(currencyPrefix(undefined)).toBe("ARS $ ");
    expect(fmtMoney(1234.56, "USD")).toBe("USD $ 1.234,56");
    expect(fmtMoney(null, "USD")).toBe("-");
  });

  it("typeLabel y periodicityLabel contemplan mapeos y fallback genérico", () => {
    expect(typeLabel("VIVIENDA" as any)).toBe("Vivienda");
    expect(typeLabel("OTRO" as any)).toBe("Otro");
    expect(typeLabel(undefined)).toBe("");

    expect(periodicityLabel("BIMENSUAL")).toBe("Bimensual");
    expect(periodicityLabel("RARA")).toBe("RARA");
    expect(periodicityLabel(undefined)).toBe("-");
  });

  it("getTime prioriza date/increaseDate/createdAt y retorna 0 si no hay fecha válida", () => {
    const dateTime = getTime({ date: "2025-05-01" });
    expect(dateTime).toBe(new Date(2025, 4, 1).getTime());

    const increase = getTime({ increaseDate: "2023-12-01" });
    expect(increase).toBe(new Date(2023, 11, 1).getTime());

    const fallback = getTime({ createdAt: "2022-07-20T15:00:00Z" });
    expect(fallback).toBe(new Date("2022-07-20T15:00:00Z").getTime());

    expect(getTime({})).toBe(0);
  });
});
