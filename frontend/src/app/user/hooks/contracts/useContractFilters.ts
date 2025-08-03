import { useState, useEffect, useCallback } from "react";
import {
  getAllContracts,
  getContractsByDateRange,
  getContractsByType,
} from "../../services/contract.service";
import type {
  Contract,
  ContractType,
  ContractStatus,
} from "../../types/contract";

export function useContractFilters(
  globalStatus: "ALL" | ContractStatus,
  onFiltered: (contracts: Contract[]) => void
) {
  const [typeFilter, setTypeFilter] = useState<"ALL" | ContractType>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const baseFetch = useCallback(async (): Promise<Contract[]> => {
    if (dateFrom && dateTo) {
      const start = `${dateFrom}T00:00:00`;
      const end = `${dateTo}T23:59:59`;
      return getContractsByDateRange(start, end);
    }
    if (typeFilter !== "ALL") {
      return getContractsByType(typeFilter);
    }
    return getAllContracts();
  }, [typeFilter, dateFrom, dateTo]);

  useEffect(() => {
    (async () => {
      let data = await baseFetch();
      if (globalStatus !== "ALL") {
        data = data.filter((c) => c.contractStatus === globalStatus);
      }
      onFiltered(data);
    })();
  }, [baseFetch, globalStatus, onFiltered]);

  return {
    typeFilter,
    setTypeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  };
}
