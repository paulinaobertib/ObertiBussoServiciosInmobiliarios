import { api } from "../../../api";
import type { CommissionCreate, Commission, CommissionStatus, CommissionPaymentType } from "../types/commission";
import type { PaymentCurrency } from "../types/payment";

/** POST /commissions/create */
export const postCommission = async (data: CommissionCreate) => {
  try {
    const response = await api.post(`/users/commissions/create`, data, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error creating commission:", error);
    throw error;
  }
};

/** PUT /commissions/update */
export const putCommission = async (data: Commission) => {
  try {
    const response = await api.put(`/users/commissions/update`, data, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error updating commission:", error);
    throw error;
  }
};

/** PATCH /commissions/updateStatus/{id}?status=... */
export const patchCommissionStatus = async (id: number, status: CommissionStatus) => {
  try {
    const response = await api.patch(`/users/commissions/updateStatus/${id}`, null, {
      params: { status },
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error updating commission status:", error);
    throw error;
  }
};

/** DELETE /commissions/delete/{id} */
export const deleteCommission = async (id: number) => {
  try {
    const response = await api.delete(`/users/commissions/delete/${id}`, {
      withCredentials: true,
    });
    return response.data as string;
  } catch (error) {
    console.error("Error deleting commission:", error);
    throw error;
  }
};

/** GET /commissions/getById/{id} */
export const getCommissionById = async (id: number) => {
  try {
    const response = await api.get(`/users/commissions/getById/${id}`, {
      withCredentials: true,
    });
    return response.data as Commission;
  } catch (error) {
    console.error(`Error fetching commission with ID ${id}:`, error);
    throw error;
  }
};

/** GET /commissions/getAll */
export const getAllCommissions = async () => {
  try {
    const response = await api.get(`/users/commissions/getAll`, {
      withCredentials: true,
    });
    return response.data as Commission[];
  } catch (error) {
    console.error("Error fetching commissions:", error);
    throw error;
  }
};

/** GET /commissions/contract/{contractId} */
export const getCommissionByContractId = async (contractId: number) => {
  try {
    const response = await api.get(`/users/commissions/contract/${contractId}`, {
      withCredentials: true,
    });
    return response.data as Commission;
  } catch (error) {
    console.error(`Error fetching commission for contract ${contractId}:`, error);
    throw error;
  }
};

/** GET /commissions/date?date=YYYY-MM-DD */
export const getCommissionsByDate = async (date: string) => {
  try {
    const response = await api.get(`/users/commissions/date`, {
      params: { date },
      withCredentials: true,
    });
    return response.data as Commission[];
  } catch (error) {
    console.error("Error fetching commissions by date:", error);
    throw error;
  }
};

/** GET /commissions/dateRange?from=YYYY-MM-DD&to=YYYY-MM-DD */
export const getCommissionsByDateRange = async (from: string, to: string) => {
  try {
    const response = await api.get(`/users/commissions/dateRange`, {
      params: { from, to },
      withCredentials: true,
    });
    return response.data as Commission[];
  } catch (error) {
    console.error("Error fetching commissions by date range:", error);
    throw error;
  }
};

/** GET /commissions/partial/remainingAmount */
export const getPartialCommissionsRemainingAmount = async () => {
  try {
    const response = await api.get(`/users/commissions/partial/remainingAmount`, {
      withCredentials: true,
    });
    return Number(response?.data ?? 0);
  } catch (error) {
    console.error("Error fetching remaining amount for partial commissions:", error);
    throw error;
  }
};

/** GET /commissions/installments?installments=N */
export const getCommissionsByInstallments = async (installments: number) => {
  try {
    const response = await api.get(`/users/commissions/installments`, {
      params: { installments },
      withCredentials: true,
    });
    return response.data as Commission[];
  } catch (error) {
    console.error("Error fetching commissions by installments:", error);
    throw error;
  }
};

/** GET /commissions/status?status=PAGADA|PARCIAL|PENDIENTE */
export const getCommissionsByStatus = async (status: CommissionStatus) => {
  try {
    const response = await api.get(`/users/commissions/status`, {
      params: { status },
      withCredentials: true,
    });
    return response.data as Commission[];
  } catch (error) {
    console.error("Error fetching commissions by status:", error);
    throw error;
  }
};

/** GET /commissions/paymentType?paymentType=COMPLETO|CUOTAS */
export const getCommissionsByPaymentType = async (paymentType: CommissionPaymentType) => {
  try {
    const response = await api.get(`/users/commissions/paymentType`, {
      params: { paymentType },
      withCredentials: true,
    });
    return (response?.data ?? []) as Commission[];
  } catch (error) {
    console.error("Error fetching commissions by payment type:", error);
    // HOTFIX: devolvemos [] en vez de throw para no romper el Promise.all ni la UI
    return [] as Commission[];
  }
};

/** GET /commissions/total/byStatus?status=...&currency=ARS|USD */
export const getTotalAmountByStatus = async (status: CommissionStatus, currency: PaymentCurrency) => {
  try {
    const r = await api.get(`/users/commissions/total/byStatus`, {
      params: { status, currency },
      withCredentials: true,
    });
    return Number(r?.data ?? 0);
  } catch (e) {
    console.error("Error fetching total amount by status:", e);
    return 0;
  }
};

/** GET /commissions/total/byDateRange?from=...&to=...&currency=... */

export const getDateTotals = async (from: string, to: string, currency: PaymentCurrency) => {
  try {
    const r = await api.get(`/users/commissions/total/byDateRange`, {
      params: { from, to, currency },
      withCredentials: true,
    });
    return Number(r?.data ?? 0);
  } catch (e) {
    console.error("Error fetching date totals:", e);
    return 0;
  }
};

/** GET /commissions/total/byYearMonth?year=YYYY&currency=... */
export const getYearMonthlyTotals = async (year: number, currency: PaymentCurrency) => {
  try {
    const r = await api.get(`/users/commissions/total/byYearMonth`, {
      params: { year, currency },
      withCredentials: true,
    });
    return (r?.data ?? {}) as Record<string, number>;
  } catch (e) {
    console.error("Error fetching year-month totals:", e);
    return {} as Record<string, number>;
  }
};

/** GET /commissions/total/status */
export const countCommissionsByStatus = async () => {
  try {
    const r = await api.get(`/users/commissions/total/status`, { withCredentials: true });
    return (r?.data ?? { PAGADA: 0, PARCIAL: 0, PENDIENTE: 0 }) as Record<CommissionStatus, number>;
  } catch (e) {
    console.error("Error counting commissions by status:", e);
    return { PAGADA: 0, PARCIAL: 0, PENDIENTE: 0 } as Record<CommissionStatus, number>;
  }
};
