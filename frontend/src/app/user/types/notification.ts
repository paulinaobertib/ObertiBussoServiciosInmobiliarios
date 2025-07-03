export type NotificationType = "PROPIEDADNUEVA" | "PROPIEDADINTERES";

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  date: string;
}

export interface NotificationCreate {
  type: NotificationType;
  date: string;
}

export interface UserNotificationPreference {
  id: number;
  userId: string;
  type: NotificationType;
  enabled: boolean;
}

export type UserNotificationPreferenceCreate = Omit<
  UserNotificationPreference,
  "id"
>;
