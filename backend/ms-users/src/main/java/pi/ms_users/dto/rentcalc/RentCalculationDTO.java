package pi.ms_users.dto.rentcalc;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class RentCalculationDTO {
    private String index;
    private Integer ipcLag;
    private BigDecimal initialAmount;
    private LocalDate startDate;
    private int months;
    // lo que se paga hoy (ultimo aumento ya calculable)
    private BigDecimal currentAmount;
    private BigDecimal accumulatedPercent;
    private List<RentPeriodDTO> periods = new ArrayList<>();
    // ultimo dato publicado del indice ("oct 2026" o la fecha del ICL)
    private String dataUpdatedTo;
    private String source;
}
