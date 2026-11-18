package pi.ms_users.rentcalcTest;

import jakarta.ws.rs.BadRequestException;
import org.junit.jupiter.api.Test;
import pi.ms_users.dto.rentcalc.RentCalculationDTO;
import pi.ms_users.dto.rentcalc.RentPeriodDTO;
import pi.ms_users.rentcalc.IndexDataSource;
import pi.ms_users.service.impl.RentCalculatorService;

import java.math.BigDecimal;
import java.time.*;
import java.util.NavigableMap;
import java.util.TreeMap;

import static org.junit.jupiter.api.Assertions.*;

class RentCalculatorServiceTest {

    // IPC que sube 2% por mes desde ene 2025 (100) hasta oct 2026 (ultimo publicado)
    static NavigableMap<YearMonth, BigDecimal> ipc() {
        TreeMap<YearMonth, BigDecimal> m = new TreeMap<>();
        BigDecimal v = BigDecimal.valueOf(100);
        for (YearMonth ym = YearMonth.of(2025, 1); !ym.isAfter(YearMonth.of(2026, 10)); ym = ym.plusMonths(1)) {
            m.put(ym, v);
            v = v.multiply(new BigDecimal("1.02"));
        }
        return m;
    }

    // ICL que sube 0,1% por dia desde 1/7/2020 hasta el 18/11/2026
    static NavigableMap<LocalDate, BigDecimal> icl() {
        TreeMap<LocalDate, BigDecimal> m = new TreeMap<>();
        double v = 1.0;
        for (LocalDate d = LocalDate.of(2020, 7, 1); !d.isAfter(LocalDate.of(2026, 11, 18)); d = d.plusDays(1)) {
            m.put(d, BigDecimal.valueOf(Math.round(v * 100) / 100.0));
            v *= 1.001;
        }
        return m;
    }

    static RentCalculatorService service(LocalDate today) {
        IndexDataSource src = new IndexDataSource() {
            public NavigableMap<YearMonth, BigDecimal> ipc() { return RentCalculatorServiceTest.ipc(); }
            public NavigableMap<LocalDate, BigDecimal> icl() { return RentCalculatorServiceTest.icl(); }
        };
        Clock clock = Clock.fixed(today.atStartOfDay(ZoneId.of("America/Argentina/Cordoba")).toInstant(), ZoneId.of("America/Argentina/Cordoba"));
        return new RentCalculatorService(src, clock);
    }

    @Test
    void ipcQuarterlyUsesLastPublishedMonths() {
        // contrato 1/4/2025, ajuste trimestral; hoy 18/11/2026
        RentCalculationDTO r = service(LocalDate.of(2026, 11, 18))
                .calculate(new BigDecimal("100000"), LocalDate.of(2025, 4, 1), 3, "ipc", null);

        assertEquals(2, r.getIpcLag());
        RentPeriodDTO first = r.getPeriods().getFirst();
        // ajuste 1/7/2025 con rezago 2: el ultimo IPC publicado al 1/7 es el de mayo -> variacion de mar, abr y may
        assertEquals(LocalDate.of(2025, 7, 1), first.getDate());
        assertEquals("feb 2025", first.getFromLabel());
        assertEquals("may 2025", first.getToLabel());
        assertEquals(3, first.getMonths().size());
        assertEquals(new BigDecimal("2.00"), first.getMonths().getFirst().percent());
        assertEquals(new BigDecimal("6.12"), first.getVariationPercent()); // 1.02^3
        assertEquals(new BigDecimal("106120.80"), first.getAmount());
    }

    @Test
    void ipcShowsNextUpdateAndStopsWhenNotPublished() {
        // ajustes: jul25, oct25, ene26, abr26, jul26, oct26 (vencidos) y ene27 (proximo)
        RentCalculationDTO r = service(LocalDate.of(2026, 11, 18))
                .calculate(new BigDecimal("100000"), LocalDate.of(2025, 4, 1), 3, "IPC", 2);

        assertEquals(7, r.getPeriods().size());
        RentPeriodDTO next = r.getPeriods().getLast();
        assertEquals(LocalDate.of(2027, 1, 1), next.getDate());
        // ene27 necesita el IPC de nov26, que no esta publicado
        assertTrue(next.isPending());
        assertTrue(next.getPendingReason().contains("noviembre"));
        assertTrue(next.getPendingReason().contains("diciembre"));
        // lo que se paga hoy es el ajuste de oct26
        assertEquals(r.getPeriods().get(5).getAmount(), r.getCurrentAmount());
        assertEquals("oct 2026", r.getDataUpdatedTo());
    }

    @Test
    void nextUpdateIsComputedWhenIndexAlreadyPublished() {
        // con rezago 2 el ajuste de dic26 usa oct26, ya publicado
        RentCalculationDTO r = service(LocalDate.of(2026, 11, 18))
                .calculate(new BigDecimal("100000"), LocalDate.of(2025, 12, 1), 12, "IPC", 2);

        RentPeriodDTO next = r.getPeriods().getLast();
        assertEquals(LocalDate.of(2026, 12, 1), next.getDate());
        assertFalse(next.isPending());
        assertNotNull(next.getAmount());
        // todavia no vencio: hoy se sigue pagando el valor inicial
        assertEquals(new BigDecimal("100000.00"), r.getCurrentAmount());
        assertEquals(new BigDecimal("0.00"), r.getAccumulatedPercent());
    }

    @Test
    void lagOneUsesThePreviousMonth() {
        RentCalculationDTO r = service(LocalDate.of(2026, 11, 18))
                .calculate(new BigDecimal("100000"), LocalDate.of(2025, 4, 1), 3, "IPC", 1);
        assertEquals("jun 2025", r.getPeriods().getFirst().getToLabel());
    }

    @Test
    void iclComparesTheDaysOfEachUpdate() {
        RentCalculationDTO r = service(LocalDate.of(2026, 11, 18))
                .calculate(new BigDecimal("200000"), LocalDate.of(2025, 11, 18), 6, "icl", null);

        RentPeriodDTO first = r.getPeriods().getFirst();
        assertEquals("18/11/2025", first.getFromLabel());
        assertEquals("18/05/2026", first.getToLabel());
        BigDecimal expected = new BigDecimal("200000").multiply(first.getToValue())
                .divide(first.getFromValue(), java.math.MathContext.DECIMAL64).setScale(2, java.math.RoundingMode.HALF_UP);
        assertEquals(expected, first.getAmount());
        // el ajuste de hoy (18/11/2026) ya tiene ICL publicado
        RentPeriodDTO second = r.getPeriods().get(1);
        assertFalse(second.isPending());
        assertEquals(second.getAmount(), r.getCurrentAmount());
        // el proximo (18/5/2027) queda pendiente
        assertTrue(r.getPeriods().getLast().isPending());
        assertNull(r.getIpcLag());
    }

    @Test
    void iclBeforeItExistedFails() {
        BadRequestException e = assertThrows(BadRequestException.class, () -> service(LocalDate.of(2026, 11, 18))
                .calculate(new BigDecimal("1000"), LocalDate.of(2019, 1, 1), 12, "ICL", null));
        assertTrue(e.getMessage().contains("IPC"));
    }

    @Test
    void validations() {
        RentCalculatorService s = service(LocalDate.of(2026, 11, 18));
        LocalDate start = LocalDate.of(2025, 4, 1);
        assertThrows(BadRequestException.class, () -> s.calculate(BigDecimal.ZERO, start, 3, "IPC", null));
        assertThrows(BadRequestException.class, () -> s.calculate(BigDecimal.TEN, null, 3, "IPC", null));
        assertThrows(BadRequestException.class, () -> s.calculate(BigDecimal.TEN, start, 13, "IPC", null));
        assertThrows(BadRequestException.class, () -> s.calculate(BigDecimal.TEN, start, 3, "UVA", null));
        assertThrows(BadRequestException.class, () -> s.calculate(BigDecimal.TEN, LocalDate.of(2027, 1, 1), 3, "IPC", null));
        // contrato anterior a la serie
        assertThrows(BadRequestException.class, () -> s.calculate(BigDecimal.TEN, LocalDate.of(2024, 1, 1), 3, "IPC", null));
    }
}
