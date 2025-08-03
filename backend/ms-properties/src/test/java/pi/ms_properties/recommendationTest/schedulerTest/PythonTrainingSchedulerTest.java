package pi.ms_properties.recommendationTest.schedulerTest;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.client.RestTemplate;
import pi.ms_properties.recommendation.scheduler.PythonTrainingScheduler;

import java.lang.reflect.Field;

public class PythonTrainingSchedulerTest {

    private PythonTrainingScheduler scheduler;

    @Mock
    private RestTemplate restTemplateMock;

    @BeforeEach
    public void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);

        scheduler = new PythonTrainingScheduler();

        Field restTemplateField = PythonTrainingScheduler.class.getDeclaredField("restTemplate");
        restTemplateField.setAccessible(true);
        restTemplateField.set(scheduler, restTemplateMock);

        Field urlField = PythonTrainingScheduler.class.getDeclaredField("mlApiUrl");
        urlField.setAccessible(true);
        urlField.set(scheduler, "http://mockserver");
    }

    // casos de exito

    @Test
    public void testTrainModel_Success() {
        when(restTemplateMock.postForObject("http://mockserver/train", null, String.class))
                .thenReturn("OK");

        scheduler.trainModel();

        verify(restTemplateMock, times(1)).postForObject("http://mockserver/train", null, String.class);
    }

    // casos de error

    @Test
    public void testTrainModel_ExceptionHandled() {
        when(restTemplateMock.postForObject(anyString(), any(), eq(String.class)))
                .thenThrow(new RuntimeException("Error"));

        assertDoesNotThrow(() -> scheduler.trainModel());

        verify(restTemplateMock, times(1)).postForObject(anyString(), any(), eq(String.class));
    }
}

