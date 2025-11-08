/** Enum equivalente al InquiryStatus del back-end */
export type InquiryStatus = "ABIERTA" | "CERRADA";

export interface InquiryCreateAuth {
  userId?: string;
  title: string;
  description: string;
  propertyIds?: number[];
}

/** Lo que envía un usuario NO autenticado */
export interface InquiryCreateAnon extends InquiryCreateAuth {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

export interface Inquiry {
  id: number;
  userId?: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  date: string;
  title: string;
  description: string;
  status: InquiryStatus;
  dateClose?: string;
  propertyTitles: string[];
}
