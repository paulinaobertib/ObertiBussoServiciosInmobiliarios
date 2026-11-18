import { api } from "../../../api";
import type { RentCalculation, RentCalculatorInput } from "../types/rentCalculator";

/** Calculadora pública de actualización de alquileres (IPC del INDEC / ICL del BCRA) */
export const calculateRent = async (input: RentCalculatorInput): Promise<RentCalculation> => {
  const { data } = await api.get(`/users/rentCalculator/calculate`, {
    params: { ...input, ipcLag: input.index === "IPC" ? input.ipcLag ?? 2 : undefined },
  });
  return data;
};
