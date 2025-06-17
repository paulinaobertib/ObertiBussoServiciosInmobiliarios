package pi.ms_properties.recommendation.recommender;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pi.ms_properties.recommendation.python.MLClient;

@Component
@RequiredArgsConstructor
public class CollaborativeRecommender {

    private final MLClient mlClient;

    public double predictInterest(String userId, Long propertyId) {
        return mlClient.predict(userId, propertyId);
    }
}

