// src/app/user/components/appointments/SlotList.tsx
import React from 'react';
import type { Appointment, AvailableAppointment } from '../../../types/appointment';
import { AppointmentItem } from './AppointmentItem';
import { Typography } from '@mui/material';

interface Props {
    slots: AvailableAppointment[];
    apptsBySlot: Record<number, Appointment>;
    onSelect: (slotId: number) => void;
}

export const AppointmentsList: React.FC<Props> = ({ slots, apptsBySlot, onSelect }) => {
    if (slots.length === 0) {
        return <Typography color="text.secondary" align="center">No hay turnos para esta fecha.</Typography>;
    }

    const sortedSlots = [...slots].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <>
            {sortedSlots.map(slot => (
                <AppointmentItem
                    key={slot.id}
                    slot={slot}
                    appt={apptsBySlot[slot.id]}
                    onClick={onSelect}
                />
            ))}
        </>
    );
};
