import type { Appointment, AvailableAppointment } from "../../../types/appointment";
import { AppointmentItem } from "./AppointmentItem";
import { EmptyState } from "../../../../shared/components/EmptyState";

interface Props {
  slots: AvailableAppointment[];
  apptsBySlot: Record<number, Appointment>;
  onSelect: (slotId: number) => void;
}

export const AppointmentsList = ({ slots, apptsBySlot, onSelect }: Props) => {
  if (slots.length === 0) {
    return <EmptyState title="No hay turnos disponibles para esta fecha." />;
  }

  const sortedSlots = [...slots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      {sortedSlots.map((slot) => (
        <AppointmentItem key={slot.id} slot={slot} appt={apptsBySlot[slot.id]} onClick={onSelect} />
      ))}
    </>
  );
};
