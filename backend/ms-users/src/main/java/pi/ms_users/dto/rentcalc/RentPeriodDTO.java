package pi.ms_users.dto.rentcalc;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

// una actualizacion del alquiler
@Data
public class RentPeriodDTO {
    private int number;
    private LocalDate date;
    // que valores del indice se compararon (ej. "nov 2025" -> "feb 2026", o fechas para el ICL)
    private String fromLabel;
    private String toLabel;
    private BigDecimal fromValue;
    private BigDecimal toValue;
    private BigDecimal variationPercent;
    private BigDecimal amount;
    private BigDecimal accumulatedPercent;
    // true = el indice todavia no se publico
    private boolean pending;
    private String pendingReason;
    // IPC: variacion de cada mes que entra en el aumento
    private List<MonthVariation> months = new ArrayList<>();

    public record MonthVariation(String label, BigDecimal percent) {
    }
}
