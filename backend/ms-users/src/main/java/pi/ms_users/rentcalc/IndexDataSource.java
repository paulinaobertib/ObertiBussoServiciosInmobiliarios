package pi.ms_users.rentcalc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.NavigableMap;

// series oficiales de los indices de actualizacion de alquileres
public interface IndexDataSource {

    // IPC nacional nivel general (INDEC), un valor por mes
    NavigableMap<YearMonth, BigDecimal> ipc();

    // Indice para Contratos de Locacion (BCRA), un valor por dia desde 1/7/2020
    NavigableMap<LocalDate, BigDecimal> icl();
}
