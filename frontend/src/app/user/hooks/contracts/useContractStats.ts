import { useCallback } from "react";
import * as contractService from "../../services/contract.service";
import { ContractStatus, ContractType } from "../../types/contract";

export const useContractStats = () => {
  const getCountByStatus = useCallback(async () => {
    const out: Record<string, number> = {};
    const statuses = Object.values(ContractStatus); // p.ej.: ['ACTIVO','INACTIVO']

    for (const s of statuses) {
      try {
        const list = await contractService.getContractsByStatus(s);
        out[s] = Array.isArray(list) ? list.length : 0;
      } catch {
        out[s] = 0;
      }
    }
    return out;
  }, []);

  const getCountByType = useCallback(async () => {
    const out: Record<string, number> = {};
    const types = Object.values(ContractType); // p.ej.: ['TEMPORAL','VIVIENDA','COMERCIAL']

    for (const t of types) {
      try {
        const list = await contractService.getContractsByType(t);
        out[t] = Array.isArray(list) ? list.length : 0;
      } catch {
        out[t] = 0;
      }
    }
    return out;
  }, []);

  return { getCountByStatus, getCountByType };
};
