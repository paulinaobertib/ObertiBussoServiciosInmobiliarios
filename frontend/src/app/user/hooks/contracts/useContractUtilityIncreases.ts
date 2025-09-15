import { useEffect, useState } from "react";
import { getContractUtilityIncreases } from "../../services/contractUtilityIncrease.service";
import type { ContractUtilityIncrease } from "../../types/contractUtilityIncrease";

export function useContractUtilityIncreases(contractUtilityId: number | null | undefined, refreshFlag: number = 0) {
  const [increases, setIncreases] = useState<ContractUtilityIncrease[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contractUtilityId) return;
    setLoading(true);
    getContractUtilityIncreases(contractUtilityId)
      .then((list) => setIncreases(list as any))
      .finally(() => setLoading(false));
  }, [contractUtilityId, refreshFlag]);

  return { increases, loading };
}

