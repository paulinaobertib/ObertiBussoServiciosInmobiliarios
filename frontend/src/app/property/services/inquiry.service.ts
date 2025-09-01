import { InquiryCreateAuth, InquiryCreateAnon, InquiryStatus } from "../types/inquiry";
import { api } from "../../../api";

export const postInquiry = async (data: InquiryCreateAuth | InquiryCreateAnon) => {
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
    const response = await api.get(`/properties/inquiries/property/${propertyId}`, { withCredentials: true });
    return response;
  } catch (error) {
    console.error("Error fetching inquiries by Property:", error);
    throw error;
  }
};

export const getInquiriesByStatus = async (status: InquiryStatus) => {
  try {
    const response = await api.get("/properties/inquiries/getByStatus", {
      params: { status },
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error fetching inquiries by Status:", error);
    throw error;
  }
};

export const getAverageInquiryResponseTime = async () => {
  try {
    const response = await api.get(`/properties/inquiries/statistics/duration`, { withCredentials: true });
    return response;
  } catch (error) {
    console.error("Error fetching average inquiry response time:", error);
    throw error;
  }
};

export const getInquiryStatusDistribution = async () => {
  try {
    const response = await api.get(`/properties/inquiries/statistics/status`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error fetching inquiry status distribution:", error);
    throw error;
  }
};

export const getInquiriesGroupedByDayOfWeek = async () => {
  try {
    const response = await api.get(`/properties/inquiries/statistics/week`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error fetching inquiries grouped by day of week:", error);
    throw error;
  }
};

export const getInquiriesGroupedByTimeRange = async () => {
  try {
    const response = await api.get(`/properties/inquiries/statistics/time`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error fetching inquiries grouped by time range:", error);
    throw error;
  }
};

export const getInquiriesPerMonth = async () => {
  try {
    const response = await api.get(`/properties/inquiries/statistics/month`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Error fetching inquiries per month:", error);
    throw error;
  }
};

export const getMostConsultedProperties = async () => {
  try {
    const response = await api.get(`/properties/inquiries/statistics/properties`, { withCredentials: true });
    return response;
  } catch (error) {
    console.error("Error fetching most consulted properties:", error);
    throw error;
  }
};
