import { api } from "../../../api";
import { AvailableAppointmentCreate, AppointmentStatus, AppointmentCreate } from "../types/appointment";

export const createAvailability = async (body: AvailableAppointmentCreate) => {
  try {
    const data = await api.post(`/users/availableAppointments/create`, body, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error creating availability:", error);
    throw error;
  }
};

/** `/availableAppointments/updateAvailability/{id}` */
export const updateAvailability = async (id: number) => {
  try {
    const data = await api.patch(`/users/availableAppointments/updateAvailability/${id}`, null, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error updating availability:", error);
    throw error;
  }
};

/** `/availableAppointments/delete/{id}` */
export const deleteAvailability = async (id: number) => {
  try {
    const data = await api.delete(`/users/availableAppointments/delete/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error deleting availability:", error);
    throw error;
  }
};

/** `/availableAppointments/getById/{id}` */
export const getAvailabilityById = async (id: number) => {
  try {
    const data = await api.get(`/users/availableAppointments/getById/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching availability by id:", error);
    throw error;
  }
};

/** `/availableAppointments/getAll` */
export const getAllAvailabilities = async () => {
  try {
    const data = await api.get(`/users/availableAppointments/getAll`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching all availabilities:", error);
    throw error;
  }
};

/** `/availableAppointments/available` */
export const getAvailableAppointments = async () => {
  try {
    const data = await api.get(`/users/availableAppointments/available`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching available appointments:", error);
    throw error;
  }
};

/** `/availableAppointments/unavailable` */
export const getUnavailableAppointments = async () => {
  try {
    const data = await api.get(`/users/availableAppointments/unavailable`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching unavailable appointments:", error);
    throw error;
  }
};

/** `/appointments/create` */
export const createAppointment = async (body: AppointmentCreate) => {
  try {
    const data = await api.post(`/users/appointments/create`, body, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

/** `/appointments/delete/{id}` */
export const deleteAppointment = async (id: number) => {
  try {
    const data = await api.delete(`/users/appointments/delete/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
};

/** `/appointments/status/{id}` */
export const updateAppointmentStatus = async (id: number, status: AppointmentStatus, address?: string) => {
  try {
    const data = await api.put(`/users/appointments/status/${id}`, null, {
      params: { status, ...(address && { address }) },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};

/** `/appointments/getById/{id}` */
export const getAppointmentById = async (id: number) => {
  try {
    const data = await api.get(`/users/appointments/getById/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching appointment by id:", error);
    throw error;
  }
};

/** `/appointments/getAll` */
export const getAllAppointments = async () => {
  try {
    const data = await api.get(`/users/appointments/getAll`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    throw error;
  }
};

/** `/appointments/user/{userId}` */
export const getAppointmentsByUser = async (userId: string) => {
  try {
    const data = await api.get(`/users/appointments/user/${userId}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching appointments by user:", error);
    throw error;
  }
};

/** `/appointments/status` */
export const getAppointmentsByStatus = async (status: AppointmentStatus) => {
  try {
    const data = await api.get(`/users/appointments/status`, {
      params: { status },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching appointments by status:", error);
    throw error;
  }
};