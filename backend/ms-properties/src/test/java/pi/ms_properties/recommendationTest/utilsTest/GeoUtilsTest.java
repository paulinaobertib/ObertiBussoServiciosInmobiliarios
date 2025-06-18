package pi.ms_properties.recommendationTest.utilsTest;

import org.junit.jupiter.api.Test;
import pi.ms_properties.recommendation.utils.GeoUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class GeoUtilsTest {
    @Test
    public void testHaversine_SamePoint_ShouldReturnZero() {
        double lat = -34.6037;
        double lon = -58.3816;
        double distancia = GeoUtils.haversine(lat, lon, lat, lon);
        assertEquals(0, distancia, 0.0001, "Distancia entre el mismo punto debería ser 0");
    }

    @Test
    public void testHaversine_KnownDistance() {
        double distancia = GeoUtils.haversine(-34.6037, -58.3816, -31.4201, -64.1888);
        assertEquals(646.74, distancia, 5, "Distancia entre Buenos Aires y Córdoba debería ser ~695 km");
    }

    @Test
    public void testHaversine_ReverseCoordinates_ShouldReturnSameDistance() {
        double lat1 = 40.7128;
        double lon1 = -74.0060;
        double lat2 = 34.0522;
        double lon2 = -118.2437;

        double dist1 = GeoUtils.haversine(lat1, lon1, lat2, lon2);
        double dist2 = GeoUtils.haversine(lat2, lon2, lat1, lon1);

        assertEquals(dist1, dist2, 0.0001, "La distancia debería ser simétrica");
    }
}
