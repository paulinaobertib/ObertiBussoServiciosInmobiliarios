import { useCallback } from "react";
import * as commissionService from "../../user/services/commission.service";
import type { CommissionStatus } from "../../user/types/commission";
import type { PaymentCurrency } from "../../user/types/payment";

const YMD = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

export const useCommission = () => {
  /** Conteo de comisiones por estado (usa /total/status) */
  const getCountByStatus = useCallback(async () => {
    return await commissionService.countCommissionsByStatus();
  }, []);

  /** Monto total por estado, por moneda (fan-out con /total/byStatus) */
  const getAmountByStatus = useCallback(async (currency: PaymentCurrency, statuses: CommissionStatus[]) => {
    const out: Record<string, number> = {};
    for (const s of statuses) {
      try {
        const total = await commissionService.getTotalAmountByStatus(s, currency);
        out[s] = Number(total ?? 0);
      } catch {
        out[s] = 0;
      }
    }
    return out; // { PAGADA: 12345, PENDIENTE: 0, ... }
  }, []);

  /** Monto total por Año-Mes (usa /total/byYearMonth) */
  const getAmountByYearMonth = useCallback(async (year: number, currency: PaymentCurrency) => {
    // Record<string /* YYYY-MM */, number>
    return await commissionService.getYearMonthlyTotals(year, currency);
  }, []);

  /** Conteo por día en un rango (agrupa la lista de /dateRange) */
  const getCountByDateRange = useCallback(async (from?: string, to?: string) => {
    const toISO = to ?? YMD(new Date());
    const fromISO = from ?? YMD(addDays(new Date(), -30));
    const list = await commissionService.getCommissionsByDateRange(fromISO, toISO); // Commission[]

    // Inferimos el campo de fecha: usar `date` (o `createdAt` si fuese tu caso)
    const counts: Record<string, number> = {};
    for (const c of list ?? []) {
      const key = (c as any)?.date ?? (c as any)?.createdAt ?? fromISO; // fallback raro para no romper
      const ymd = typeof key === "string" ? key.slice(0, 10) : YMD(new Date(key));
      counts[ymd] = (counts[ymd] ?? 0) + 1;
    }
    return counts; // { "2025-09-18": 3, "2025-09-19": 1, ... }
  }, []);

  return {
    getCountByStatus,
    getAmountByStatus,
    getAmountByYearMonth,
    getCountByDateRange,
  };
};
