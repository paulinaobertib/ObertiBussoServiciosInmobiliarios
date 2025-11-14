package pi.ms_properties.comparerTest.controllerTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.comparer.controller.ComparisonController;
import pi.ms_properties.comparer.dto.PropertyDTOAI;
import pi.ms_properties.comparer.service.AzureOpenAIService;
import pi.ms_properties.comparer.service.GeolocationService;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertySimpleDTO;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComparisonControllerTest {

    @Mock
    private GeolocationService geoService;

    @Mock
    private AzureOpenAIService azureOpenAIService;

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
        when(azureOpenAIService.compareProperties(List.of(geo1, geo2)))
                .thenReturn("Comparación realizada correctamente");

        ResponseEntity<String> response = controller.comparer(List.of(prop1, prop2));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Comparación realizada correctamente", response.getBody());
    }

    @Test
    void shouldReturnSearchResult_whenQueryIsValid() {
        List<PropertySimpleDTO> mockList = List.of(new PropertySimpleDTO(), new PropertySimpleDTO());

        when(azureOpenAIService.searchAndReturnProperties("casa con pileta"))
                .thenReturn(ResponseEntity.ok(mockList));

        ResponseEntity<List<PropertySimpleDTO>> response =
                controller.searchFull("casa con pileta");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
    }

    // casos de error

    @Test
    void shouldReturnBadRequest_whenLessThan2Properties() {
        ResponseEntity<String> response = controller.comparer(List.of(prop1));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Debe enviar 2 o 3 propiedades.", response.getBody());
    }

    @Test
    void shouldReturnBadRequest_whenMoreThan3Properties() {
        ResponseEntity<String> response = controller.comparer(List.of(prop1, prop2, prop1, prop2));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Debe enviar 2 o 3 propiedades.", response.getBody());
    }

    @Test
    void shouldPropagateError_whenSearchFails() {
        when(azureOpenAIService.searchAndReturnProperties(any()))
                .thenThrow(new RuntimeException("IA error"));

        assertThrows(RuntimeException.class,
                () -> controller.searchFull("algo"));
    }

    @Test
    void shouldReturnOk_whenSearchReturnsEmptyList() {
        when(azureOpenAIService.searchAndReturnProperties(any()))
                .thenReturn(ResponseEntity.ok(List.of()));

        ResponseEntity<List<PropertySimpleDTO>> response = controller.searchFull("dep");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());
    }
}