package pi.ms_users.service.impl;

import jakarta.ws.rs.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pi.ms_users.dto.rentcalc.RentCalculationDTO;
import pi.ms_users.dto.rentcalc.RentPeriodDTO;
import pi.ms_users.rentcalc.IndexDataSource;
import pi.ms_users.service.interf.IRentCalculatorService;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;
import java.util.NavigableMap;

// actualizacion de alquileres por IPC (INDEC) o ICL (BCRA), como las calculadoras publicas
@Service
public class RentCalculatorService implements IRentCalculatorService {

    static final int MAX_PERIODS = 120;

    private static final String[] MONTHS = {"ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"};
    private static final String[] MONTHS_LONG = {"enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
            "agosto", "septiembre", "octubre", "noviembre", "diciembre"};
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.ROOT);
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final IndexDataSource data;

    private final Clock clock;

    @Autowired
    public RentCalculatorService(IndexDataSource data) {
        this(data, Clock.system(ZoneId.of("America/Argentina/Cordoba")));
    }

    // el reloj se puede fijar en los tests
    public RentCalculatorService(IndexDataSource data, Clock clock) {
        this.data = data;
        this.clock = clock;
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }

    @Override
    public RentCalculationDTO calculate(BigDecimal amount, LocalDate startDate, int months, String index, Integer ipcLag) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) throw new BadRequestException("El valor del alquiler tiene que ser mayor a cero.");
        if (startDate == null) throw new BadRequestException("Falta la fecha de inicio del contrato.");
        if (months < 1 || months > 12) throw new BadRequestException("La frecuencia de actualización tiene que ser de 1 a 12 meses.");
        if (startDate.isAfter(today())) throw new BadRequestException("La fecha de inicio no puede ser futura.");
        String idx = index == null ? "" : index.trim().toUpperCase(Locale.ROOT);

        RentCalculationDTO out = new RentCalculationDTO();
        out.setIndex(idx);
        out.setInitialAmount(amount.setScale(2, RoundingMode.HALF_UP));
        out.setStartDate(startDate);
        out.setMonths(months);

        switch (idx) {
            case "IPC" -> {
                int lag = ipcLag == null ? 2 : ipcLag;
                if (lag < 0 || lag > 3) throw new BadRequestException("El rezago del IPC tiene que ser de 0 a 3 meses.");
                out.setIpcLag(lag);
                calculateIpc(out, data.ipc(), lag);
                out.setSource("INDEC – Índice de Precios al Consumidor, nivel general nacional (base dic. 2016)");
            }
            case "ICL" -> {
                calculateIcl(out, data.icl());
                out.setSource("BCRA – Índice para Contratos de Locación (Ley 27.551)");
            }
            default -> throw new BadRequestException("Elegí un índice: IPC o ICL.");
        }

        // lo que corresponde pagar hoy: el ultimo aumento ya vencido y calculado
        BigDecimal current = out.getInitialAmount();
        for (RentPeriodDTO p : out.getPeriods()) {
            if (!p.isPending() && !p.getDate().isAfter(today())) current = p.getAmount();
        }
        out.setCurrentAmount(current);
        out.setAccumulatedPercent(percent(current.divide(out.getInitialAmount(), MathContext.DECIMAL64)));
        return out;
    }

    private void calculateIpc(RentCalculationDTO out, NavigableMap<YearMonth, BigDecimal> ipc, int lag) {
        out.setDataUpdatedTo(label(ipc.lastKey()));
        BigDecimal amount = out.getInitialAmount();
        for (int k = 1; k <= MAX_PERIODS; k++) {
            LocalDate date = out.getStartDate().plusMonths((long) k * out.getMonths());
            if (!includePeriod(out, date)) break;

            // al ajustar en el mes M se usa la variacion de los "months" meses que terminan en M - rezago
            YearMonth to = YearMonth.from(date).minusMonths(lag);
            YearMonth from = to.minusMonths(out.getMonths());
            if (!ipc.containsKey(from)) {
                throw new BadRequestException("No hay datos del IPC para " + label(from) + ". La serie empieza en " + label(ipc.firstKey()) + ".");
            }

            RentPeriodDTO p = new RentPeriodDTO();
            p.setNumber(k);
            p.setDate(date);
            p.setFromLabel(label(from));
            p.setToLabel(label(to));
            p.setFromValue(ipc.get(from));
            if (!ipc.containsKey(to)) {
                p.setPending(true);
                p.setPendingReason("El INDEC publica el IPC de " + MONTHS_LONG[to.getMonthValue() - 1] + " a mediados de "
                        + MONTHS_LONG[to.plusMonths(1).getMonthValue() - 1] + ".");
                out.getPeriods().add(p);
                break;
            }
            for (YearMonth m = from.plusMonths(1); !m.isAfter(to); m = m.plusMonths(1)) {
                p.getMonths().add(new RentPeriodDTO.MonthVariation(label(m), percent(ratio(ipc.get(m), ipc.get(m.minusMonths(1))))));
            }
            BigDecimal factor = ratio(ipc.get(to), ipc.get(from));
            amount = amount.multiply(factor).setScale(2, RoundingMode.HALF_UP);
            fill(out, p, ipc.get(to), factor, amount);
        }
    }

    private void calculateIcl(RentCalculationDTO out, NavigableMap<LocalDate, BigDecimal> icl) {
        if (out.getStartDate().isBefore(icl.firstKey())) {
            throw new BadRequestException("El ICL existe desde el " + DAY.format(icl.firstKey()) + ". Para contratos anteriores usá el IPC.");
        }
        out.setDataUpdatedTo(DAY.format(icl.lastKey()));
        BigDecimal amount = out.getInitialAmount();
        LocalDate prev = out.getStartDate();
        for (int k = 1; k <= MAX_PERIODS; k++) {
            LocalDate date = out.getStartDate().plusMonths((long) k * out.getMonths());
            if (!includePeriod(out, date)) break;

            // ICL del dia del ajuste / ICL del dia del ajuste anterior (o del inicio)
            RentPeriodDTO p = new RentPeriodDTO();
            p.setNumber(k);
            p.setDate(date);
            p.setFromLabel(DAY.format(prev));
            p.setToLabel(DAY.format(date));
            p.setFromValue(valueAt(icl, prev));
            if (date.isAfter(icl.lastKey())) {
                p.setPending(true);
                p.setPendingReason("El BCRA todavía no publicó el ICL del " + DAY.format(date) + ".");
                out.getPeriods().add(p);
                break;
            }
            BigDecimal to = valueAt(icl, date);
            BigDecimal factor = ratio(to, p.getFromValue());
            amount = amount.multiply(factor).setScale(2, RoundingMode.HALF_UP);
            fill(out, p, to, factor, amount);
            prev = date;
        }
    }

    // se muestran los ajustes ya vencidos y el proximo
    private boolean includePeriod(RentCalculationDTO out, LocalDate date) {
        if (!date.isAfter(today())) return true;
        return out.getPeriods().stream().noneMatch(p -> p.getDate().isAfter(today()));
    }

    private void fill(RentCalculationDTO out, RentPeriodDTO p, BigDecimal toValue, BigDecimal factor, BigDecimal amount) {
        p.setToValue(toValue);
        p.setVariationPercent(percent(factor));
        p.setAmount(amount);
        p.setAccumulatedPercent(percent(amount.divide(out.getInitialAmount(), MathContext.DECIMAL64)));
        out.getPeriods().add(p);
    }

    // valor publicado ese dia o, si ese dia falta, el ultimo anterior
    private static BigDecimal valueAt(NavigableMap<LocalDate, BigDecimal> icl, LocalDate date) {
        Map.Entry<LocalDate, BigDecimal> e = icl.floorEntry(date);
        return e != null ? e.getValue() : icl.firstEntry().getValue();
    }

    private static BigDecimal ratio(BigDecimal a, BigDecimal b) {
        return a.divide(b, MathContext.DECIMAL64);
    }

    private static BigDecimal percent(BigDecimal factor) {
        return factor.subtract(BigDecimal.ONE).multiply(HUNDRED).setScale(2, RoundingMode.HALF_UP);
    }

    private static String label(YearMonth m) {
        return MONTHS[m.getMonthValue() - 1] + " " + m.getYear();
    }
}
