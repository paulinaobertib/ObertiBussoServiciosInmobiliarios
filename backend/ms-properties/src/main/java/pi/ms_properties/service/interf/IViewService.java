package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Property;

import java.time.LocalDateTime;
import java.util.Map;

public interface IViewService {
    void createView(Property property, LocalDateTime date);

    ResponseEntity<Map<String, Long>> getViewsByProperty();

    ResponseEntity<Map<String, Long>> getViewsByPropertyType();

    ResponseEntity<Map<String, Long>> getViewsByDay();

    ResponseEntity<Map<String, Long>> getViewsByMonth();

    ResponseEntity<Map<String, Long>> getViewsByNeighborhood();

    ResponseEntity<Map<String, Long>> getViewsByNeighborhoodType();

    ResponseEntity<Map<String, Long>> getViewsByState();

    ResponseEntity<Map<String, Long>> getViewsByOperation();

    ResponseEntity<Map<Float, Long>> getViewsByRooms();

    ResponseEntity<Map<String, Long>> getViewsByAmenity();
}
