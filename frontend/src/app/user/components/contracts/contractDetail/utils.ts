import type { Contract } from "../../../types/contract";

const parseISOAsLocal = (iso?: string | null) => {
  if (!iso) return null;
  // YYYY-MM-DD → construimos Date local para evitar el shift de timezone
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d); // local midnight
  }
  // Si viene con hora/Z/offset, dejamos que JS lo parsee normal
  return new Date(iso);
};

export const fmtDate = (iso?: string | null) => {
  const d = parseISOAsLocal(iso);
  return d ? d.toLocaleDateString("es-AR") : "-";
};

export const fmtLongDate = (iso: string) => {
  const d = parseISOAsLocal(iso)!;
  const m = d.toLocaleString("es-AR", { month: "long" });
  return `${d.getDate()} de ${m.charAt(0).toUpperCase() + m.slice(1)} del ${d.getFullYear()}`;
};

export const currencyLabel = (c?: string | null) => (c === "USD" ? "USD" : "ARS");
export const currencyPrefix = (c?: string | null) => (c === "USD" ? "USD $ " : "ARS $ ");
export const fmtMoney = (n?: number | null, currency?: string | null) =>
  n != null ? `${currencyPrefix(currency)}${n.toLocaleString("es-AR")}` : "-";

export const typeLabel = (t?: Contract["contractType"]) => {
  if (!t) return "";
  const map: Record<string, string> = { VIVIENDA: "Vivienda", COMERCIAL: "Comercial", TEMPORAL: "Temporal" };
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

export const getTime = (x: any) => {
  const d = parseISOAsLocal(x?.date ?? x?.increaseDate ?? x?.createdAt ?? null);
  return d ? d.getTime() : 0;
};
