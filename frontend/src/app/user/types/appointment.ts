export type AppointmentStatus = "ACEPTADO" | "RECHAZADO" | "ESPERA";

export interface AvailableAppointment {
  id: number;
  date: string;
  availability: boolean;
}

export interface AvailableAppointmentCreate {
  date: string;
  startTime: string;
  endTime: string;
}

export interface Appointment {
  id: number;
  userId: string;
  comment?: string;
  status: AppointmentStatus;
  availableAppointment: Pick<AvailableAppointment, "id">;
  appointmentDate: string;
}

export type AppointmentCreate = Omit<Appointment, "id">;
