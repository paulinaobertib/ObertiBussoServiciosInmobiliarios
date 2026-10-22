import { api } from "../../../api";
import type { Receipt, ReceiptCreate, ReceiptFilters } from "../types/receipt";

// con responseType "blob" los errores del backend también llegan como Blob: se pasan a texto
const blobErrorToText = async (e: any) => {
  const data = e?.response?.data;
  if (data instanceof Blob) {
    try {
      e.response.data = await data.text();
    } catch {
      // se deja el error como vino
    }
  }
  throw e;
};

const clean = (filters: ReceiptFilters) =>
  Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== ""));

export const createReceipt = async (body: ReceiptCreate): Promise<Receipt> => {
  const { data } = await api.post(`/users/receipts/create`, body, { withCredentials: true });
  return data;
};

/** PDF de muestra sin guardar ni numerar */
export const previewReceipt = async (body: ReceiptCreate): Promise<Blob> => {
  const { data } = await api
    .post(`/users/receipts/preview`, body, { withCredentials: true, responseType: "blob" })
    .catch(blobErrorToText);
  return data;
};

export const searchReceipts = async (filters: ReceiptFilters = {}): Promise<Receipt[]> => {
  const { data } = await api.get(`/users/receipts/search`, { params: clean(filters), withCredentials: true });
  return Array.isArray(data) ? data : [];
};

export const getReceiptsByContract = async (contractId: number): Promise<Receipt[]> => {
  const { data } = await api.get(`/users/receipts/getByContract/${contractId}`, { withCredentials: true });
  return Array.isArray(data) ? data : [];
};

export const getMyReceipts = async (): Promise<Receipt[]> => {
  const { data } = await api.get(`/users/receipts/mine`, { withCredentials: true });
  return Array.isArray(data) ? data : [];
};

export const annulReceipt = async (id: number, reason: string): Promise<Receipt> => {
  const { data } = await api.patch(`/users/receipts/annul/${id}`, { reason }, { withCredentials: true });
  return data;
};

export const getReceiptPdf = async (id: number): Promise<Blob> => {
  const { data } = await api
    .get(`/users/receipts/pdf/${id}`, { withCredentials: true, responseType: "blob" })
    .catch(blobErrorToText);
  return data;
};

export const receiptFileName = (r: Pick<Receipt, "kind" | "number">) =>
  `${r.kind === "RECIBO" ? "Recibo" : "Liquidacion"}-${r.number}.pdf`;
