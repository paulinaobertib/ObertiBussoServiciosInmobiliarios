import { api } from "../../../api";
import type {
  CommissionCreate,
  Commission,
  CommissionStatus,
  CommissionPaymentType,
} from "../types/commission";
import type { PaymentCurrency } from "../types/payment";

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

export const getCommissionsByPaymentType = async (paymentType: CommissionPaymentType) => {
  try {
    const response = await api.get(`/users/commissions/paymentType`, {
      params: { paymentType },
      withCredentials: true,
    });
    return response.data as Commission[];
  } catch (error) {
    console.error("Error fetching commissions by payment type:", error);
    throw error;
  }
};

export const getTotalAmountByStatus = async (status: CommissionStatus, currency: PaymentCurrency) => {
  try {
    const response = await api.get(`/users/commissions/total/byStatus`, {
      params: { status, currency },
      withCredentials: true,
    });
    return response.data as number;
  } catch (error) {
    console.error("Error fetching total amount by status:", error);
    throw error;
  }
};

export const getDateTotals = async (from: string, to: string, currency: PaymentCurrency) => {
  try {
    const response = await api.get(`/users/commissions/total/byDateRange`, {
      params: { from, to, currency },
      withCredentials: true,
    });
    return response.data as number;
  } catch (error) {
    console.error("Error fetching date totals:", error);
    throw error;
  }
};

export const getYearMonthlyTotals = async (year: number, currency: PaymentCurrency) => {
  try {
    const response = await api.get(`/users/commissions/total/byYearMonth`, {
      params: { year, currency },
      withCredentials: true,
    });
    return response.data as Record<string, number>;
  } catch (error) {
    console.error("Error fetching year-month totals:", error);
    throw error;
  }
};

export const countCommissionsByStatus = async () => {
  try {
    const response = await api.get(`/users/commissions/total/status`, {
      withCredentials: true,
    });
    return response.data as Record<CommissionStatus, number>;
  } catch (error) {
    console.error("Error counting commissions by status:", error);
    throw error;
  }
};
