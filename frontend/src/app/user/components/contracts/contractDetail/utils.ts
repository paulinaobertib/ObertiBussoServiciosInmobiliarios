import type { Contract } from "../../../types/contract";

export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-AR") : "-";

export const fmtLongDate = (iso: string) => {
  const d = new Date(iso);
  const m = d.toLocaleString("es-AR", { month: "long" });
  return `${d.getDate()} de ${m.charAt(0).toUpperCase() + m.slice(1)} del ${d.getFullYear()}`;
};

export const currencyLabel = (c?: string | null) => (c === "USD" ? "USD" : "ARS");
export const currencyPrefix = (c?: string | null) => (c === "USD" ? "USD $ " : "ARS $ ");
export const fmtMoney = (n?: number | null, currency?: string | null) =>
  n != null ? `${currencyPrefix(currency)}${n.toLocaleString("es-AR")}` : "-";

export const typeLabel = (t?: Contract["contractType"]) => {
  if (!t) return "";
  const map: Record<string, string> = {
    VIVIENDA: "Vivienda",
    COMERCIAL: "Comercial",
    TEMPORAL: "Temporal",
  };
  return map[t] ?? t.charAt(0) + t.slice(1).toLowerCase();
};

export const periodicityLabel = (p?: string | null) => {
  const map: Record<string, string> = {
    UNICO: "Único",
    MENSUAL: "Mensual",
    BIMENSUAL: "Bimensual",
    TRIMESTRAL: "Trimestral",
    SEMESTRAL: "Semestral",
    ANUAL: "Anual",
  };
  return (p && map[p]) || p || "-";
};

export const getTime = (x: any) =>
  new Date(x?.date ?? x?.increaseDate ?? x?.createdAt ?? 0).getTime();
