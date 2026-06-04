package pi.ms_properties.wasi;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Short-lived cache of raw Wasi property search results (plan: ~5 min TTL).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WasiPropertyListCache {

    private final WasiApiClient wasiApiClient;
    private final WasiApiProperties props;

    private volatile List<JsonNode> cachedNodes = List.of();
    private volatile long cachedAtMillis;

    public List<JsonNode> getOrLoadAll() {
        if (!props.isConfigured()) {
            return List.of();
        }
        long now = System.currentTimeMillis();
        int ttlMs = Math.max(60_000, props.getCacheTtlMinutes() * 60_000);
        if (!cachedNodes.isEmpty() && (now - cachedAtMillis) < ttlMs) {
            return cachedNodes;
        }
        synchronized (this) {
            if (!cachedNodes.isEmpty() && (now - cachedAtMillis) < ttlMs) {
                return cachedNodes;
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
                log.warn("Wasi property list load failed: {}", e.getMessage());
            }
            cachedNodes = List.copyOf(acc);
            cachedAtMillis = System.currentTimeMillis();
            return cachedNodes;
        }
    }

    public void invalidate() {
        synchronized (this) {
            cachedNodes = List.of();
            cachedAtMillis = 0;
        }
    }
}
