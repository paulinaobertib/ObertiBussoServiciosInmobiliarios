import { useState, useEffect, useCallback } from "react";
import { getAllContracts, getContractsByDateRange } from "../../services/contract.service";
import type { Contract, ContractType, ContractStatus } from "../../types/contract";

export function useContractFilters(
  globalStatus: "ALL" | ContractStatus,
  onFiltered: (contracts: Contract[]) => void
) {
  const [typeFilter, setTypeFilter] = useState<"ALL" | ContractType>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const baseFetch = useCallback(async (): Promise<Contract[]> => {
    if (dateFrom && dateTo) return getContractsByDateRange(dateFrom, dateTo);
    return getAllContracts();
  }, [dateFrom, dateTo]);

  useEffect(() => {
    (async () => {
      let data = await baseFetch();

      if (typeFilter !== "ALL") {
        data = data.filter(c => c.contractType === typeFilter);
      }
      if (globalStatus !== "ALL") {
        data = data.filter(c => c.contractStatus === globalStatus);
      }

      onFiltered(data);
    })();
  }, [baseFetch, typeFilter, globalStatus, onFiltered]);

  return { typeFilter, setTypeFilter, dateFrom, setDateFrom, dateTo, setDateTo };
}
