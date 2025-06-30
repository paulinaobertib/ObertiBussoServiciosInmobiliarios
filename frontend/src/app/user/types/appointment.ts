export type AppointmentStatus = 'ACEPTADO' | 'RECHAZADO' | 'ESPERA'; 

export interface AvailableAppointment {
  id: number;
  date: string;
  availability: boolean;
}

export interface AvailableAppointmentDTO {
  date: string; 
  startTime: string;    
  endTime: string;
}

export interface Appointment {
  id: number;
  userId: string;
  comment?: string;
  status: AppointmentStatus;
  availableAppointment: Pick<AvailableAppointment, 'id'>;
}

export type AppointmentCreate = Omit<Appointment, "id">;
