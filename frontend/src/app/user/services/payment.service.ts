import { api } from "../../../api";
import type { Payment, PaymentCreate, PaymentUpdate, PaymentConcept, PaymentCurrency } from "../types/payment";

/** POST /users/payments/create */
export const postPayment = async (paymentData: PaymentCreate) => {
  try {
    const response = await api.post(`/users/payments/create`, paymentData, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

/** PUT /users/payments/update */
export const putPayment = async (paymentData: PaymentUpdate) => {
  try {
    const response = await api.put(`/users/payments/update`, paymentData, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
};

/** DELETE /users/payments/delete/{id} */
export const deletePayment = async (paymentData: Payment) => {
  try {
    const response = await api.delete(`/users/payments/delete/${paymentData.id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw error;
  }
};

/** GET /users/payments/getById/{id} */
export const getPaymentById = async (id: number) => {
  try {
    const response = await api.get(`/users/payments/getById/${id}`, { withCredentials: true });
    return response.data as Payment;
  } catch (error) {
    console.error(`Error fetching payment with ID ${id}:`, error);
    throw error;
  }
};

/** GET /users/payments/getByContract/{contractId} */
export const getPaymentsByContractId = async (contractId: number) => {
  try {
    const response = await api.get(`/users/payments/getByContract/${contractId}`, { withCredentials: true });
    return response.data as Payment[];
  } catch (error) {
    console.error(`Error fetching payments for contract ${contractId}:`, error);
    throw error;
  }
};

/** GET /users/payments/getByCommission/{commissionId} */
export const getPaymentsByCommissionId = async (commissionId: number) => {
  try {
    const response = await api.get(`/users/payments/getByCommission/${commissionId}`, { withCredentials: true });
    return response.data as Payment[];
  } catch (error) {
    console.error(`Error fetching payments for commission ${commissionId}:`, error);
    throw error;
  }
};

/** GET /users/payments/getAll */
export const getAllPayments = async () => {
  try {
    const response = await api.get(`/users/payments/getAll`, { withCredentials: true });
    return (response?.data ?? []) as Payment[];
  } catch (error) {
    console.error("Error fetching payments:", error);
    return [] as Payment[];
  }
};

/** GET /users/payments/dateRange?from=YYYY-MM-DD&to=YYYY-MM-DD */
export const getPaymentsByDateRange = async (from: string, to: string) => {
  try {
    const response = await api.get(`/users/payments/dateRange`, {
      params: { from, to },
      withCredentials: true,
    });
    return (response?.data ?? []) as Payment[];
  } catch (error) {
    console.error("Error fetching payments by date range:", error);
    return [] as Payment[];
  }
};

/** GET /users/payments/contractRange?from=YYYY-MM-DD&to=YYYY-MM-DD */
export const getPaymentsByContractRange = async (from: string, to: string) => {
  try {
    const response = await api.get(`/users/payments/contractRange`, {
      params: { from, to },
      withCredentials: true,
    });
    return (response?.data ?? []) as Payment[];
  } catch (error) {
    console.error("Error fetching payments by contract range:", error);
    return [] as Payment[];
  }
};

/** GET /users/payments/commissionRange?from=YYYY-MM-DD&to=YYYY-MM-DD */
export const getPaymentsByCommissionRange = async (from: string, to: string) => {
  try {
    const response = await api.get(`/users/payments/commissionRange`, {
      params: { from, to },
      withCredentials: true,
    });
    return (response?.data ?? []) as Payment[];
  } catch (error) {
    console.error("Error fetching payments by commission range:", error);
    return [] as Payment[];
  }
};

/** GET /users/payments/utilityRange?from=YYYY-MM-DD&to=YYYY-MM-DD */
export const getPaymentsByUtilityRange = async (from: string, to: string) => {
  try {
    const response = await api.get(`/users/payments/utilityRange`, {
      params: { from, to },
      withCredentials: true,
    });
    return (response?.data ?? []) as Payment[];
  } catch (error) {
    console.error("Error fetching payments by utility range:", error);
    return [] as Payment[];
  }
};

/** GET /users/payments/getByConcept?concept=ALQUILER|EXTRA|COMISION */
export const getPaymentsByConcept = async (concept: PaymentConcept) => {
  try {
    const response = await api.get(`/users/payments/getByConcept`, {
      params: { concept },
      withCredentials: true,
    });
    return (response?.data ?? []) as Payment[];
  } catch (error) {
    console.error("Error fetching payments by concept:", error);
    return [] as Payment[];
  }
};

/** GET /users/payments/getByCurrency?currency=ARS|USD */
export const getPaymentsByCurrency = async (currency: PaymentCurrency) => {
  try {
    const response = await api.get(`/users/payments/getByCurrency`, {
      params: { currency },
      withCredentials: true,
    });
    return (response?.data ?? []) as Payment[];
  } catch (error) {
    console.error("Error fetching payments by currency:", error);
    return [] as Payment[];
  }
};

/** GET /users/payments/monthlyTotals?from=...&to=...&currency=ARS|USD */
export const getPaymentsMonthlyTotals = async (
  from: string,
  to: string,
  currency: PaymentCurrency
) => {
  try {
    const response = await api.get(`/users/payments/monthlyTotals`, {
      params: { from, to, currency },
      withCredentials: true,
    });
    return response.data as Record<string, number>; // "YYYY-MM" -> total en currency
  } catch (error) {
    console.error("Error fetching payments monthly totals:", error);
    throw error;
  }
};
