export type Role = "ADMIN" | "USER" | "TENANT";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  mail: string;
  phone: string;
}

export type UserCreate = Omit<User, "id">;