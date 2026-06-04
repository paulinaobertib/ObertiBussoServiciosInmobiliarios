package pi.ms_users.wasi;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class UsersWasiApiClient {

    private final WasiApiProperties props;
    private final WebClient.Builder webClientBuilder;

    private void ensure() {
        if (!props.isConfigured()) {
            throw new IllegalStateException("Wasi not configured");
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
        ensure();
        return webClientBuilder.build().get()
                .uri(uriWithCreds(path, query == null ? Map.of() : query))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode postForm(String path, MultiValueMap<String, String> formFields) {
        ensure();
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        if (formFields != null) {
            form.addAll(formFields);
        }
        form.add("id_company", props.getIdCompany());
        form.add("wasi_token", props.getToken());
        URI uri = UriComponentsBuilder.fromUriString(props.getBaseUrl().replaceAll("/$", "") + path).build(true).toUri();
        return webClientBuilder.build().post()
                .uri(uri)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode searchClients(Map<String, String> query) {
        return get("/client/search", query != null ? query : new HashMap<>());
    }

    public JsonNode addClient(MultiValueMap<String, String> fields) {
        return postForm("/client/add", fields);
    }
}
