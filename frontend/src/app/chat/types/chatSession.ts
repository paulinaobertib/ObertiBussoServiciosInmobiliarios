import { Property } from "../../property/types/property";

export interface ChatSession {
  id: number;
  userId?: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  date: string;
  dateClose?: string;
  derived: boolean;
  property: Pick<Property, "id">;
}

export interface ChatSessionDTO {
  userId?: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  propertyId: number;
}

export interface ChatSessionGetDTO {
  id: number;
  userId?: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  date: string;
  dateClose?: string;
  propertyId: number;
}
