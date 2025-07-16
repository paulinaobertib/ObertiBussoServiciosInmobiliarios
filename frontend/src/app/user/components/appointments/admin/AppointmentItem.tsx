import { Button } from '@mui/material';
import type { AvailableAppointment } from '../../../types/appointment';

interface Props {
    slot: AvailableAppointment;
    color: 'success' | 'warning' | 'info' | 'error' | undefined;
    onClick: (s: AvailableAppointment) => void;
}

export const AppointmentItem = ({ slot, color, onClick }: Props) => (
    <Button
        key={slot.id}
        size="small"

        variant={slot.availability ? 'contained' : 'outlined'}
        color={color}
        onClick={() => onClick(slot)}
    >
        {slot.date.slice(11, 16)}
    </Button>
);
