import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Box } from "@mui/material";

export interface Props {
  onSelectDate: (date: Dayjs) => void;
  initialDate?: Dayjs;
}

export const Calendar = ({ onSelectDate, initialDate = dayjs() }: Props) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(initialDate);

  const handleDayChange = (d: Dayjs | null) => {
    if (!d) return;
    setSelectedDate(d);
    onSelectDate(d);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "100%", display: "grid", placeItems: "center" }}>
        <DateCalendar
          value={selectedDate}
          onChange={handleDayChange}
          disablePast
          shouldDisableDate={(d) => d.day() === 0 || d.day() === 6}
          // Responsivo y centrado
          sx={{
            width: "100%",
            maxWidth: 360,
            mx: "auto",
            "& .MuiPickersCalendarHeader-label": {
              fontSize: { xs: "1rem", sm: "0.85rem" },
              fontWeight: 600,
              textTransform: "capitalize",
            },
            "& .MuiPickersArrowSwitcher-button .MuiSvgIcon-root": {
              fontSize: { xs: "1rem", sm: "0.85rem" },
            },
            "& .MuiTypography-root": {
              fontSize: { xs: "0.95rem", sm: "0.8rem" },
            },
            "& .MuiPickersDay-root": {
              fontSize: { xs: "0.9rem", sm: "0.75rem" },
            },
            "& .MuiDayCalendar-weekDayLabel": {
              fontSize: { xs: "0.8rem", sm: "0.7rem" },
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};
