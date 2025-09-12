import { useState, useEffect, useCallback } from "react";
import { getAllContracts } from "../../services/contract.service";
import type { Contract, ContractType, ContractStatus } from "../../types/contract";

const parseYMD = (s: string) => new Date(`${s}T00:00:00`);

export function useContractFilters(
  globalStatus: "ALL" | ContractStatus,
  onFiltered: (contracts: Contract[]) => void
) {
  const [typeFilter, setTypeFilter] = useState<"ALL" | ContractType>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const baseFetch = useCallback(async (): Promise<Contract[]> => {
    // Traemos siempre todo y filtramos en el front para evitar
    // diferencias de semántica con el endpoint de rango.
    let data: Contract[] = await getAllContracts();

    const hasFrom = !!dateFrom;
    const hasTo   = !!dateTo;

    if (hasFrom || hasTo) {
      const fromTs = hasFrom ? parseYMD(dateFrom).getTime() : Number.NEGATIVE_INFINITY;
      const toTs   = hasTo   ? new Date(`${dateTo}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY;

      data = data.filter((c: Contract) => {
        const s = c.startDate ? new Date(c.startDate).getTime() : NaN;
        const e = c.endDate   ? new Date(c.endDate).getTime()   : NaN;
        if (isNaN(s) || isNaN(e)) return false;

        if (hasFrom && hasTo) return s >= fromTs && e <= toTs; // contenido en el rango
        if (hasFrom)          return s >= fromTs;               // sólo desde
        return e <= toTs;                                       // sólo hasta
      });
    }

    return data;
  }, [dateFrom, dateTo]);

  useEffect(() => {
    (async () => {
      let data = await baseFetch();

      // Filtro por tipo
      if (typeFilter !== "ALL") {
        data = data.filter((c: Contract) => c.contractType === typeFilter);
      }
      // Filtro por estado
      if (globalStatus !== "ALL") {
        data = data.filter((c: Contract) => c.contractStatus === globalStatus);
      }

      onFiltered(data);
    })();
  }, [baseFetch, typeFilter, globalStatus, onFiltered]);

  return { typeFilter, setTypeFilter, dateFrom, setDateFrom, dateTo, setDateTo };
}
