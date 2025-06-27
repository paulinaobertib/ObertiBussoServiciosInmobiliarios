package pi.ms_properties.comparerTest.controllerTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import pi.ms_properties.comparer.controller.ComparisonController;
import pi.ms_properties.comparer.dto.PropertyDTOAI;
import pi.ms_properties.comparer.service.GeminiService;
import pi.ms_properties.comparer.service.GeolocationService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComparisonControllerTest {

    @Mock
    private GeolocationService geoService;

    @Mock
    private GeminiService geminiService;

    @InjectMocks
    private ComparisonController controller;

    private PropertyDTOAI prop1;
    private PropertyDTOAI prop2;

    @BeforeEach
    void setUp() {
        prop1 = new PropertyDTOAI();
        prop2 = new PropertyDTOAI();
    }

    // casos de exito

    @Test
    void shouldReturnComparisonResult_when2ValidProperties() {
        PropertyDTOAI geo1 = new PropertyDTOAI();
        PropertyDTOAI geo2 = new PropertyDTOAI();

        when(geoService.geolocation(prop1)).thenReturn(geo1);
        when(geoService.geolocation(prop2)).thenReturn(geo2);
        when(geminiService.compareProperties(List.of(geo1, geo2)))
                .thenReturn("Comparación hecha");

        var response = controller.comparer(List.of(prop1, prop2));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Comparación hecha", response.getBody());
    }

    // casos de error

    @Test
    void shouldReturnBadRequest_whenLessThan2Properties() {
        var response = controller.comparer(List.of(prop1));
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Debe enviar 2 o 3 propiedades.", response.getBody());
    }

    @Test
    void shouldReturnBadRequest_whenMoreThan3Properties() {
        var response = controller.comparer(List.of(prop1, prop2, prop1, prop2));
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Debe enviar 2 o 3 propiedades.", response.getBody());
    }
}