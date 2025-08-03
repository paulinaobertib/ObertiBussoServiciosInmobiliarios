package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.Test;
import pi.ms_properties.service.impl.GeocodingNeighborhoodService;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class GeocodingNeighborhoodServiceTest {

    private final GeocodingNeighborhoodService service = new GeocodingNeighborhoodService();

    // casos de exito

    @Test
    void getCoordinates_existingNeighborhood_integrationSuccess() {
        Optional<GeocodingNeighborhoodService.Coordinates> result =
                service.getCoordinates("Palermo", "Buenos Aires");

        assertTrue(result.isPresent(), "Debería devolver coordenadas para Palermo, Buenos Aires");

        result.ifPresent(coordinates -> {
            System.out.println("Latitud: " + coordinates.latitude());
            System.out.println("Longitud: " + coordinates.longitude());

            assertTrue(coordinates.latitude() >= -90 && coordinates.latitude() <= 90);
            assertTrue(coordinates.longitude() >= -180 && coordinates.longitude() <= 180);
        });
    }

    // casos de error

    @Test
    void getCoordinates_nonExistingNeighborhood_integrationReturnsEmpty() {
        Optional<GeocodingNeighborhoodService.Coordinates> result =
                service.getCoordinates("BarrioQueNoExisteXYZ", "CiudadQueNoExisteXYZ");

        assertTrue(result.isEmpty(), "No debería devolver coordenadas para un barrio que no existe");
    }
}