package pi.ms_properties.recommendationTest.recommenderTest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.recommendation.python.MLClient;
import pi.ms_properties.recommendation.recommender.CollaborativeRecommender;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CollaborativeRecommenderTest {

    @Mock
    private MLClient mlClient;

    @InjectMocks
    private CollaborativeRecommender collaborativeRecommender;

    // casos de exito

    @Test
    void predictInterest_shouldReturnPredictionFromMLClient() {
        String userId = "user123";
        Long propertyId = 10L;
        double expectedPrediction = 0.75;

        when(mlClient.predict(userId, propertyId)).thenReturn(expectedPrediction);

        double result = collaborativeRecommender.predictInterest(userId, propertyId);

        assertEquals(expectedPrediction, result);

        verify(mlClient, times(1)).predict(userId, propertyId);
    }

    // casos de error
    @Test
    void predictInterest_shouldThrowException_whenMLClientFails() {
        String userId = "user123";
        Long propertyId = 10L;

        when(mlClient.predict(userId, propertyId))
                .thenThrow(new RuntimeException("ML API failure"));

        assertThrows(RuntimeException.class, () ->
            collaborativeRecommender.predictInterest(userId, propertyId));

        verify(mlClient, times(1)).predict(userId, propertyId);
    }
}
