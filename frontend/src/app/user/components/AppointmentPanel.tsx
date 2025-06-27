import React, { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

export interface AppointmentData {
  date: string;
  time: string;
}

/**
 * AppointmentPanel – 100 % fluid / no fixed widths
 * - Uses horizontal (calendar | slots) if container ≥ 750 px; vertical otherwise.
 */
export default function AppointmentPanel() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // generate 30‑min slots 10–13h
  const times: string[] = [];
  for (let h = 10; h <= 13; h++) [0, 30].forEach((m) => {
    if (h === 13 && m > 0) return;
    times.push(`${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'}`);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      date: selectedDate?.format('YYYY-MM-DD'),
      time: selectedTime,
      notes,
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'column', md: 'row' },
        gap: 3,
        width: '100%',
      }}
    >
      {/* CALENDARIO */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
            Seleccioná un día
          </Typography>
          <DateCalendar
            value={selectedDate}
            onChange={setSelectedDate}
            disablePast
            shouldDisableDate={(d) => d.day() === 0 || d.day() === 6}
            sx={{
              width: '100%',
              '& .MuiPickersDay-root': {
                width: { xs: 38, sm: 42, md: 46 },
                height: { xs: 38, sm: 42, md: 46 },
                margin: 0.5,
              },
            }}
          />
        </Box>
      </LocalizationProvider>

      {/* SLOTS + NOTAS */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Horarios */}
        <Box>
          <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
            Horarios disponibles
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(2, 1fr)',
              },
              gap: 1,
            }}
          >
            {times.map((t) => (
              <Button
                key={t}
                variant={selectedTime === t ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setSelectedTime(t)}
              >
                {t}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Notas */}
        <TextField
          label="Necesidades especiales"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          disabled={!selectedTime}
          fullWidth
          sx={{ py: 1.3 }}
        >
          Solicitar Turno
        </Button>
      </Box>
    </Box>
  );
}
