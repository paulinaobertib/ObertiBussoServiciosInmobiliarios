import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Box, Typography, Button } from '@mui/material';

export interface AppointmentData {
    date: string;
    time: string;
}

export interface Props {
    onSelectSlot?: (slot: AppointmentData) => void;
}

export const Calendar = ({ onSelectSlot }: Props) => {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const times: string[] = [];
    for (let h = 10; h <= 13; h++) {
        [0, 30].forEach(m => {
            if (h === 13 && m > 0) return;
            const hh = String(h).padStart(2, '0');
            const mm = m === 0 ? '00' : '30';
            times.push(`${hh}:${mm}`);
        });
    }

    const handleDayChange = (day: Dayjs | null) => {
        setSelectedDate(day);
        setSelectedTime(null);
    };

    const handleSlotClick = (time: string) => {
        setSelectedTime(time);
        if (selectedDate) {
            onSelectSlot?.({ date: selectedDate.format('YYYY-MM-DD'), time });
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Seleccioná un día
                </Typography>
                <DateCalendar
                    value={selectedDate}
                    onChange={handleDayChange}
                    disablePast
                    shouldDisableDate={d => d.day() === 0 || d.day() === 6}
                    sx={{ width: '100%', mb: 2 }}
                />

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Horarios disponibles
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: 1,
                    }}
                >
                    {times.map(t => (
                        <Button
                            key={t}
                            size="small"
                            variant={selectedTime === t ? 'contained' : 'outlined'}
                            onClick={() => handleSlotClick(t)}
                        >
                            {t}
                        </Button>
                    ))}
                </Box>
            </Box>
        </LocalizationProvider>
    );
}
