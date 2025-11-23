import { formatCurrencyAmount } from "../../shared/utils/numberFormat";

export const formatPrice = (price: number, currency: string) => formatCurrencyAmount(price, currency);
