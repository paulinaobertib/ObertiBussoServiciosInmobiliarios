import { Payment, PaymentCreate } from "../types/payment";
import { api } from "../../../api";

export const postPayment = async (paymentData: PaymentCreate) => {
  try {
    const response = await api.post(`/users/payments/create`, paymentData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

export const putPayment = async (paymentData: Payment) => {
  try {
    const response = await api.put(`/users/payments/update`, paymentData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
};

export const deletePayment = async (paymentData: Payment) => {
  try {
    const response = await api.delete(
      `/users/payments/delete/${paymentData.id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw error;
  }
};

export const getPaymentById = async (id: number) => {
  try {
    const response = await api.get(`/users/payments/getById/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment with ID ${id}:`, error);
    throw error;
  }
};

export const getPaymentsByContractId = async (contractId: number) => {
  try {
    const response = await api.get(`/users/payments/contract/${contractId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching payments for contract ${contractId}:`, error);
    throw error;
  }
};

export const getPaymentsByDate = async (contractId: number, date: string) => {
  try {
    const response = await api.get(`/users/payments/getByDate`, {
      params: { contractId, date },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching payments by date:", error);
    throw error;
  }
};

export const getPaymentsByDateBetween = async (
  contractId: number,
  start: string,
  end: string
) => {
  try {
    const response = await api.get(`/users/payments/getByDateBetween`, {
      params: { contractId, start, end },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching payments by date range:", error);
    throw error;
  }
};
