package pi.ms_properties.wasi;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Cache en memoria de las propiedades de Wasi (raw JsonNode).
 *
 * El fetch a Wasi (paginado, ~131 props) es pesado y antes corría EN EL HILO DE LA REQUEST,
 * lo que en un App Service con poca CPU tardaba >10s -> 504. Ahora el fetch se hace SIEMPRE en
 * segundo plano (scheduler + refrescos async) y las requests leen el snapshot en memoria al
 * instante, sin bloquear nunca.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WasiPropertyListCache {

    private final WasiApiClient wasiApiClient;
    private final WasiApiProperties props;

    private volatile List<JsonNode> cachedNodes = List.of();
    private volatile long cachedAtMillis;

    /** Evita disparar varios refrescos async en paralelo. */
    private final AtomicBoolean refreshing = new AtomicBoolean(false);

    /** Hilo daemon dedicado para los refrescos async (no bloquea el shutdown de la JVM). */
    private final ExecutorService refreshExecutor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "wasi-cache-refresh");
        t.setDaemon(true);
        return t;
    });

    /**
     * Devuelve el snapshot en memoria al instante. NUNCA hace el fetch en vivo en el hilo
     * de la request. Si todavía está vacío (recién arrancó), dispara un refresco en background.
     */
    public List<JsonNode> getOrLoadAll() {
        if (!props.isConfigured()) {
            return List.of();
        }
        if (cachedNodes.isEmpty()) {
            triggerAsyncRefresh();
        }
        return cachedNodes;
    }

    /**
     * Refresco periódico en segundo plano. Corre en el thread pool del scheduler (no en requests).
     * Primera corrida ~15s después de arrancar; luego cada wasi.api.cache-refresh-ms (default 5 min).
     */
    @Scheduled(initialDelayString = "${wasi.api.cache-refresh-initial-ms:15000}",
            fixedDelayString = "${wasi.api.cache-refresh-ms:300000}")
    public void scheduledRefresh() {
        refresh();
    }

    /**
     * Llamado tras publicar/actualizar una propiedad en Wasi. No vacía el cache (para no dejar el
     * catálogo sin propiedades de Wasi mientras tanto): solo pide un refresco en background.
     */
    public void invalidate() {
        triggerAsyncRefresh();
    }

    private void triggerAsyncRefresh() {
        if (!props.isConfigured()) {
            return;
        }
        if (refreshing.compareAndSet(false, true)) {
            refreshExecutor.submit(() -> {
                try {
                    refresh();
                } finally {
                    refreshing.set(false);
                }
            });
        }
    }

    /**
     * Trae TODAS las propiedades de Wasi (paginado) y reemplaza el cache.
     * Si falla, MANTIENE la lista anterior (no vacía el catálogo ante un error transitorio).
     * Es bloqueante (WebClient.block) -> solo se invoca desde threads de background.
     */
    public synchronized void refresh() {
        if (!props.isConfigured()) {
            return;
        }
        List<JsonNode> acc = new ArrayList<>();
        int skip = 0;
        try {
            while (true) {
                JsonNode root = wasiApiClient.searchProperties(Map.of(
                        "skip", String.valueOf(skip),
                        "take", "100",
                        "scope", "3"
                ));
                if (root == null || !WasiJsonUtil.isSuccess(root)) {
                    break;
                }
                List<JsonNode> page = WasiJsonUtil.indexedItems(root);
                if (page.isEmpty()) {
                    break;
                }
                acc.addAll(page);
                skip += page.size();
                if (page.size() < 100) {
                    break;
                }
                if (skip > 5000) {
                    log.warn("Wasi property fetch stopped at {} items (safety cap)", skip);
                    break;
                }
            }
        } catch (Exception e) {
            log.warn("Wasi property list refresh failed (se mantienen {} items previos): {}",
                    cachedNodes.size(), e.getMessage());
            return;
        }
        cachedNodes = List.copyOf(acc);
        cachedAtMillis = System.currentTimeMillis();
        log.info("Wasi property cache refrescado: {} items", cachedNodes.size());
    }
}
