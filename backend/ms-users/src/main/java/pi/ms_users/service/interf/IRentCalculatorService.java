package pi.ms_users.service.interf;

import pi.ms_users.dto.rentcalc.RentCalculationDTO;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface IRentCalculatorService {
    RentCalculationDTO calculate(BigDecimal amount, LocalDate startDate, int months, String index, Integer ipcLag);
}
