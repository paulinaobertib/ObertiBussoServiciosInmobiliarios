package pi.ms_properties.recommendation.scheduler;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PythonTrainingScheduler {

    @Value("${ml.api.url}")
    private String mlApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // todos los lunes a las 5:00 AM
    @Scheduled(cron = "0 0 5 * * MON")
    public void trainModel() {
        try {
            String url = mlApiUrl + "/train";
            String respuesta = restTemplate.postForObject(url, null, String.class);
            System.out.println("Respuesta del servidor Python: " + respuesta);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}