package pi.ms_users.configuration.components;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Component
public class AppProperties {

    private final String frontendBaseUrl;

    // public AppProperties(@Value("${frontend.base-url}") String frontendBaseUrl) {
    //     this.frontendBaseUrl = frontendBaseUrl;
    // }

    // Momentaneo mientras genero los pipelines del backend que no tiene el front configurado
    public AppProperties(@Value("${frontend.base-url:}") String frontendBaseUrl) {
        this.frontendBaseUrl = frontendBaseUrl;
    }
    
}

