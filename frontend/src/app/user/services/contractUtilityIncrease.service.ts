import { api } from "../../../api";
import type { ContractUtilityIncrease, ContractUtilityIncreaseCreate } from "../types/contractUtilityIncrease";

export const postContractUtilityIncrease = async (data: ContractUtilityIncreaseCreate) => {
  const resp = await api.post(`/users/contractUtilityIncreases/create`, data, { withCredentials: true });
  return resp.data as string;
};

export const putContractUtilityIncrease = async (data: ContractUtilityIncrease) => {
  const resp = await api.put(`/users/contractUtilityIncreases/update`, data, { withCredentials: true });
  return resp.data as string;
};

export const deleteContractUtilityIncrease = async (id: number) => {
  const resp = await api.delete(`/users/contractUtilityIncreases/delete/${id}`, { withCredentials: true });
  return resp.data as string;
};

export const getContractUtilityIncreases = async (contractUtilityId: number) => {
  const resp = await api.get(`/users/contractUtilityIncreases/getByContractUtility/${contractUtilityId}`, {
    withCredentials: true,
  });
  return resp.data as Array<{ id: number; adjustmentDate: string; amount: number }>;
};
