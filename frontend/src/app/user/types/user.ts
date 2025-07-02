export type Role = "admin" | "user" | "tenant";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone: string;
}

export type UserCreate = Omit<User, "id">;
