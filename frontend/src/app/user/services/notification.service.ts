import { api } from "../../../api";
import {
  NotificationCreate,
  NotificationType,
  UserNotificationPreferenceCreate,
} from "../types/notification";

/** `/notifications/create/property` */
export const createPropertyNotification = async (
  body: NotificationCreate,
  propertyId: number
) => {
  try {
    const data = await api.post(`/users/notifications/create/property`, body, {
      params: { propertyId },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error creating property notification:", error);
    throw error;
  }
};

/** `/notifications/create/interestProperty` */
export const createInterestNotification = async (
  userId: string,
  type: NotificationType,
  propertyId: number
) => {
  try {
    const data = await api.post(
      `/users/notifications/create/interestProperty`,
      null,
      {
        params: { userId, type, propertyId },
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    console.error("Error creating interest notification:", error);
    throw error;
  }
};

/** `/notifications/getById/{id}` */
export const getNotificationById = async (id: number) => {
  try {
    const data = await api.get(`/users/notifications/getById/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching notification by id:", error);
    throw error;
  }
};

/** `/notifications/getAll` */
export const getAllNotifications = async () => {
  try {
    const data = await api.get(`/users/notifications/getAll`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    throw error;
  }
};

/** `/notifications/user/{userId}` */
export const getNotificationsByUser = async (userId: string) => {
  try {
    const data = await api.get(`/users/notifications/user/${userId}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching notifications by user:", error);
    throw error;
  }
};

/** `/preference/create` */
export const createUserNotificationPreference = async (
  body: UserNotificationPreferenceCreate
) => {
  try {
    const data = await api.post(`/users/preference/create`, body, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error creating user notification preference:", error);
    throw error;
  }
};

/** `/preference/update/{id}` */
export const updateUserNotificationPreference = async (
  id: number,
  enabled: boolean
) => {
  try {
    const data = await api.put(`/users/preference/update/${id}`, null, {
      params: { enabled },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error updating user notification preference:", error);
    throw error;
  }
};

/** `/preference/getById/{id}` */
export const getUserNotificationPreferenceById = async (id: number) => {
  try {
    const data = await api.get(`/users/preference/getById/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching user notification preference by id:", error);
    throw error;
  }
};

/** `/preference/user/{userId}` */
export const getUserNotificationPreferencesByUser = async (userId: string) => {
  try {
    const data = await api.get(`/users/preference/user/${userId}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error(
      "Error fetching user notification preferences by user:",
      error
    );
    throw error;
  }
};

/** `/preference/active?type={NotificationType}` */
export const getActiveUsersByPreferenceType = async (
  type: NotificationType
) => {
  try {
    const data = await api.get(`/users/preference/active`, {
      params: { type },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching active users by preference type:", error);
    throw error;
  }
};
