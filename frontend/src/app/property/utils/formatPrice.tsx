export const formatPrice = (price: number, currency: string) => {
  const locale = currency === "USD" ? "en-US" : "es-AR";
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
  });
  const formattedNumber = formatter.format(price);
  return `${currency} $${formattedNumber}`;
};
