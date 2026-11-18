package pi.ms_users.rentcalc;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.ws.rs.ServiceUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.*;
import java.util.Collections;
import java.util.NavigableMap;
import java.util.TreeMap;

// INDEC (via datos.gob.ar) y BCRA; se guardan en memoria unas horas para no consultar en cada calculo
@Slf4j
@Component
public class OfficialIndexDataSource implements IndexDataSource {

    static final LocalDate ICL_START = LocalDate.of(2020, 7, 1);

    private final String ipcUrl;
    private final String bcraUrl;
    private final Duration ttl;

    private final WebClient webClient = WebClient.builder()
            .exchangeStrategies(ExchangeStrategies.builder()
                    .codecs(c -> c.defaultCodecs().maxInMemorySize(4 * 1024 * 1024))
                    .build())
            .build();

    private volatile Cached<YearMonth> ipcCache;
    private volatile Cached<LocalDate> iclCache;

    private record Cached<K>(NavigableMap<K, BigDecimal> data, Instant fetchedAt) {
    }

    public OfficialIndexDataSource(
            @Value("${rent-calculator.ipc-url:https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26&limit=1000&format=json}") String ipcUrl,
            @Value("${rent-calculator.bcra-url:https://api.bcra.gob.ar/estadisticas/v4.0/monetarias/40}") String bcraUrl,
            @Value("${rent-calculator.cache-hours:6}") long cacheHours) {
        this.ipcUrl = ipcUrl;
        this.bcraUrl = bcraUrl;
        this.ttl = Duration.ofHours(cacheHours);
    }

    @Override
    public NavigableMap<YearMonth, BigDecimal> ipc() {
        Cached<YearMonth> c = ipcCache;
        if (c != null && c.fetchedAt().plus(ttl).isAfter(Instant.now())) return c.data();
        synchronized (this) {
            c = ipcCache;
            if (c != null && c.fetchedAt().plus(ttl).isAfter(Instant.now())) return c.data();
            try {
                ipcCache = new Cached<>(fetchIpc(), Instant.now());
            } catch (Exception e) {
                // si la fuente no responde se sigue usando lo ultimo que se tenia
                log.warn("No se pudo actualizar el IPC", e);
                if (c != null) return c.data();
                throw new ServiceUnavailableException("No se pudieron obtener los datos del IPC (INDEC). Probá de nuevo en unos minutos.");
            }
            return ipcCache.data();
        }
    }

    @Override
    public NavigableMap<LocalDate, BigDecimal> icl() {
        Cached<LocalDate> c = iclCache;
        if (c != null && c.fetchedAt().plus(ttl).isAfter(Instant.now())) return c.data();
        synchronized (this) {
            c = iclCache;
            if (c != null && c.fetchedAt().plus(ttl).isAfter(Instant.now())) return c.data();
            try {
                iclCache = new Cached<>(fetchIcl(), Instant.now());
            } catch (Exception e) {
                log.warn("No se pudo actualizar el ICL", e);
                if (c != null) return c.data();
                throw new ServiceUnavailableException("No se pudieron obtener los datos del ICL (BCRA). Probá de nuevo en unos minutos.");
            }
            return iclCache.data();
        }
    }

    private JsonNode get(String url) {
        return webClient.get().uri(url).retrieve().bodyToMono(JsonNode.class).block(Duration.ofSeconds(30));
    }

    // {"data": [["2026-10-01", 12785.93], ...]}
    private NavigableMap<YearMonth, BigDecimal> fetchIpc() {
        JsonNode root = get(ipcUrl);
        TreeMap<YearMonth, BigDecimal> map = new TreeMap<>();
        for (JsonNode row : root.path("data")) {
            if (row.size() < 2 || row.get(1).isNull()) continue;
            map.put(YearMonth.from(LocalDate.parse(row.get(0).asText())), row.get(1).decimalValue());
        }
        if (map.isEmpty()) throw new IllegalStateException("IPC vacio");
        return Collections.unmodifiableNavigableMap(map);
    }

    // la API del BCRA devuelve hasta 1000 filas: se pide por tramos de un año
    private NavigableMap<LocalDate, BigDecimal> fetchIcl() {
        TreeMap<LocalDate, BigDecimal> map = new TreeMap<>();
        LocalDate end = LocalDate.now(ZoneId.of("America/Argentina/Cordoba")).plusDays(60);
        for (LocalDate from = ICL_START; !from.isAfter(end); from = from.plusYears(1)) {
            LocalDate to = from.plusYears(1).minusDays(1);
            JsonNode root = get(bcraUrl + "?desde=" + from + "&hasta=" + (to.isAfter(end) ? end : to) + "&limit=1000");
            for (JsonNode result : root.path("results")) {
                for (JsonNode d : result.path("detalle")) {
                    map.put(LocalDate.parse(d.path("fecha").asText()), d.path("valor").decimalValue());
                }
            }
        }
        if (map.isEmpty()) throw new IllegalStateException("ICL vacio");
        return Collections.unmodifiableNavigableMap(map);
    }
}
