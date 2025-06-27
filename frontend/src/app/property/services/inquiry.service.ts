import {
  InquiryCreateAuth,
  InquiryCreateAnon,
  InquiryStatus,
} from "../types/inquiry";
import { api } from "../../../api";

/* ---------- CREACIÓN ---------- */
export const postInquiry = async (data: InquiryCreateAuth | InquiryCreateAnon) => {
  console.log(data);
  try {
    const response = await api.post(`/properties/inquiries/create`, data, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error creating inquiry:", error);
    throw error;
  }
};

/* ---------- ACTUALIZAR ESTADO ---------- */
export const updateInquiry = async (id: number) => {
  try {
    const response = await api.put(`/properties/inquiries/status/${id}`, null, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error closing inquiry:", error);
    throw error;
  }
};

/* ---------- GET ---------- */
export const getInquiryById = async (id: number) => {
  try {
    const response = await api.get(`/properties/inquiries/getById/${id}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error fetching inquiry by ID:", error);
    throw error;
  }
};

export const getAllInquiries = async () => {
  try {
    const response = await api.get(`/properties/inquiries/getAll`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error fetching all inquiries:", error);
    throw error;
  }
};

export const getInquiriesByUser = async (userId: string) => {
  try {
    const response = await api.get(`/properties/inquiries/user/${userId}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error fetching inquiries by User:", error);
    throw error;
  }
};

export const getInquiriesByProperty = async (propertyId: number) => {
  try {
    const response = await api.get(
      `/properties/inquiries/property/${propertyId}`,
      { withCredentials: true }
    );
    return response;           // ya venía así
  } catch (error) {
    console.error('Error fetching inquiries by Property:', error);
    throw error;
  }
};

export const getInquiriesByStatus = async (status: InquiryStatus) => {
  try {
    const response = await api.get('/properties/inquiries/getByStatus', {
      params: { status },
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error('Error fetching inquiries by Status:', error);
    throw error;
  }
};
