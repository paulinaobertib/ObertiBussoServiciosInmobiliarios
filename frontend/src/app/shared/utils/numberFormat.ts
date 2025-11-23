const amountFormatter = new Intl.NumberFormat("es-AR", {
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const normalizeValue = (value?: number | string | null) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const formatAmount = (value?: number | string | null) => amountFormatter.format(normalizeValue(value));

export const formatCurrencyAmount = (value?: number | string | null, currency?: string | null) => {
  const prefix = currency === "USD" ? "USD $ " : "ARS $ ";
  return `${prefix}${formatAmount(value)}`;
};
