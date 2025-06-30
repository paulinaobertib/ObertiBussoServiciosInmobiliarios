// src/app/appointment/components/Calendar.tsx
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  LocalizationProvider,
} from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Box, Typography } from '@mui/material';

export interface Props {
  onSelectDate: (date: Dayjs) => void;
  initialDate?: Dayjs;
}

export const Calendar = ({
  onSelectDate,
  initialDate = dayjs(),
}: Props) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(initialDate);

  const handleDayChange = (d: Dayjs | null) => {
    if (!d) return;
    setSelectedDate(d);
    onSelectDate(d);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
      >
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Seleccioná un día
        </Typography>

        <DateCalendar
          value={selectedDate}
          onChange={handleDayChange}
          disablePast
          shouldDisableDate={d => d.day() === 0 || d.day() === 6}
        />
      </Box>
    </LocalizationProvider>
  );
};
