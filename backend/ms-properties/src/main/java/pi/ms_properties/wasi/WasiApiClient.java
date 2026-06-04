package pi.ms_properties.wasi;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WasiApiClient {

    private final WasiApiProperties props;
    @Qualifier("wasiWebClient")
    private final WebClient wasiWebClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private void ensureConfigured() {
        if (!props.isConfigured()) {
            throw new IllegalStateException("Wasi API is not configured (WASI_ID_COMPANY / WASI_TOKEN)");
        }
    }

    private URI uriWithCreds(String path, Map<String, String> query) {
        UriComponentsBuilder b = UriComponentsBuilder.fromUriString(props.getBaseUrl().replaceAll("/$", "") + path);
        b.queryParam("id_company", props.getIdCompany());
        b.queryParam("wasi_token", props.getToken());
        if (query != null) {
            query.forEach(b::queryParam);
        }
        return b.build(true).toUri();
    }

    public JsonNode get(String path, Map<String, String> query) {
        ensureConfigured();
        URI uri = uriWithCreds(path, query == null ? Map.of() : query);
        try {
            return wasiWebClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        } catch (Exception e) {
            log.error("Wasi GET {} failed: {}", path, e.getMessage());
            throw e;
        }
    }

    public JsonNode postForm(String path, MultiValueMap<String, String> formFields) {
        ensureConfigured();
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        if (formFields != null) {
            form.addAll(formFields);
        }
        form.add("id_company", props.getIdCompany());
        form.add("wasi_token", props.getToken());
        URI uri = UriComponentsBuilder.fromUriString(props.getBaseUrl().replaceAll("/$", "") + path).build(true).toUri();
        try {
            return wasiWebClient.post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(form))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        } catch (Exception e) {
            log.error("Wasi POST {} failed: {}", path, e.getMessage());
            throw e;
        }
    }

    public JsonNode searchProperties(Map<String, String> filters) {
        Map<String, String> q = new HashMap<>(filters != null ? filters : Map.of());
        if (!q.containsKey("take")) {
            q.put("take", "100");
        }
        if (!q.containsKey("skip")) {
            q.put("skip", "0");
        }
        return get("/property/search", q);
    }

    public JsonNode getProperty(int wasiPropertyId, boolean shortResponse) {
        Map<String, String> q = new HashMap<>();
        if (shortResponse) {
            q.put("short", "true");
        }
        return get("/property/get/" + wasiPropertyId, q);
    }

    public JsonNode addProperty(MultiValueMap<String, String> fields) {
        return postForm("/property/add", fields);
    }

    public JsonNode updateProperty(int wasiPropertyId, MultiValueMap<String, String> fields) {
        return postForm("/property/update/" + wasiPropertyId, fields);
    }

    public void uploadPropertyImage(int wasiPropertyId, byte[] data, String filename, String description, int position) {
        ensureConfigured();
        URI uri = uriWithCreds("/property/upload-image/" + wasiPropertyId, Map.of());
        String fn = filename != null && !filename.isBlank() ? filename : "image.jpg";
        ByteArrayResource resource = new ByteArrayResource(data) {
            @Override
            public String getFilename() {
                return fn;
            }
        };
        HttpHeaders imageHeaders = new HttpHeaders();
        imageHeaders.setContentDisposition(
                ContentDisposition.builder("form-data").name("image").filename(fn).build());
        imageHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.add("image", new HttpEntity<>(resource, imageHeaders));
        if (description != null) {
            parts.add("description", description);
        }
        parts.add("position", String.valueOf(position));
        try {
            JsonNode resp = wasiWebClient.post()
                    .uri(uri)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(parts))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
            if (resp != null && !WasiJsonUtil.isSuccess(resp)) {
                log.warn("Wasi upload-image non-success: {}", resp);
            }
        } catch (Exception e) {
            log.error("Wasi upload image failed: {}", e.getMessage());
            throw e;
        }
    }

    public JsonNode sendPropertyToPortal(int wasiPropertyId) {
        return postForm("/portal/send-property/" + wasiPropertyId, new LinkedMultiValueMap<>());
    }

    public JsonNode listPortals() {
        return get("/portal/all", Map.of());
    }

    public JsonNode makePdf(int wasiPropertyId) {
        return get("/property/make-pdf/" + wasiPropertyId, Map.of());
    }

    /**
     * Devuelve la URL del PDF de una propiedad. El endpoint /property/make-pdf de Wasi responde con
     * un 302 cuya cabecera Location es la URL firmada del PDF (no JSON), así que capturamos ese
     * Location sin seguir el redirect. Algunas cuentas pueden devolver JSON {url}; se contempla también.
     * Devuelve null si no se puede obtener.
     */
    public String makePdfUrl(int wasiPropertyId) {
        ensureConfigured();
        URI uri = uriWithCreds("/property/make-pdf/" + wasiPropertyId, Map.of());
        try {
            return wasiWebClient.get()
                    .uri(uri)
                    .exchangeToMono(resp -> {
                        if (resp.statusCode().is3xxRedirection()) {
                            String loc = resp.headers().asHttpHeaders().getFirst(HttpHeaders.LOCATION);
                            return reactor.core.publisher.Mono.justOrEmpty(loc);
                        }
                        return resp.bodyToMono(JsonNode.class).map(j -> {
                            String u = j.path("url").asText("");
                            return u.isEmpty() ? j.path("data").path("url").asText("") : u;
                        });
                    })
                    .block();
        } catch (Exception e) {
            log.error("Wasi make-pdf URL {} failed: {}", wasiPropertyId, e.getMessage());
            return null;
        }
    }

    public JsonNode companyDetails() {
        return get("/company/details/", Map.of());
    }

    public JsonNode regionsFromCountry(int countryId) {
        return get("/location/regions-from-country/" + countryId, Map.of());
    }

    public JsonNode citiesFromRegion(int regionId) {
        return get("/location/cities-from-region/" + regionId, Map.of());
    }

    public JsonNode allCountries() {
        return get("/location/all-countries", Map.of());
    }

    public JsonNode addClient(MultiValueMap<String, String> fields) {
        return postForm("/client/add", fields);
    }

    public JsonNode searchClients(Map<String, String> query) {
        return get("/client/search", query != null ? query : Map.of());
    }

    public List<JsonNode> parseList(JsonNode root) {
        return WasiJsonUtil.indexedItems(root);
    }
}
