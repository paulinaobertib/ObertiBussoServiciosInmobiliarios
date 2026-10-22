import { api } from "../../../api";
import type { ContractDocumentInfo, ContractExtraField, ContractExtraction } from "../types/contractPdf";

const asForm = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return form;
};

/** Lee el PDF de un contrato y devuelve los datos encontrados (no guarda nada) */
export const extractContractFromPdf = async (file: File): Promise<ContractExtraction> => {
  const { data } = await api.post(`/users/contracts/extractFromPdf`, asForm(file), {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 150_000,
  });
  return data;
};

export const uploadContractDocument = async (contractId: number, file: File): Promise<ContractDocumentInfo> => {
  const { data } = await api.post(`/users/contracts/${contractId}/document`, asForm(file), {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

/** null si el contrato no tiene PDF adjunto */
export const getContractDocumentInfo = async (contractId: number): Promise<ContractDocumentInfo | null> => {
  const res = await api.get(`/users/contracts/${contractId}/document/info`, { withCredentials: true });
  return res.status === 204 || !res.data ? null : res.data;
};

export const getContractDocument = async (contractId: number): Promise<Blob> => {
  const { data } = await api.get(`/users/contracts/${contractId}/document`, {
    withCredentials: true,
    responseType: "blob",
  });
  return data;
};

export const deleteContractDocument = async (contractId: number) => {
  await api.delete(`/users/contracts/${contractId}/document`, { withCredentials: true });
};

export const getContractExtraFields = async (contractId: number): Promise<ContractExtraField[]> => {
  const { data } = await api.get(`/users/contracts/${contractId}/extraFields`, { withCredentials: true });
  return Array.isArray(data) ? data : [];
};

export const putContractExtraFields = async (
  contractId: number,
  fields: ContractExtraField[]
): Promise<ContractExtraField[]> => {
  const { data } = await api.put(`/users/contracts/${contractId}/extraFields`, fields, { withCredentials: true });
  return Array.isArray(data) ? data : [];
};
