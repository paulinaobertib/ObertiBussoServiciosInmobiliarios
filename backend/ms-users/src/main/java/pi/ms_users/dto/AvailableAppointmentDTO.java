package pi.ms_users.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AvailableAppointmentDTO {
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
}
