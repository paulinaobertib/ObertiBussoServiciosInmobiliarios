package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pi.ms_properties.service.impl.ViewService;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/view")
public class ViewController {

    private final ViewService viewService;

    @GetMapping("/property")
    public ResponseEntity<Map<String, Long>> getByProperty() {
        return viewService.getViewsByProperty();
    }

    @GetMapping("/propertyType")
    public ResponseEntity<Map<String, Long>> getByPropertyType() {
        return viewService.getViewsByPropertyType();
    }

    @GetMapping("/day")
    public ResponseEntity<Map<String, Long>> getByDay() {
        return viewService.getViewsByDay();
    }

    @GetMapping("/month")
    public ResponseEntity<Map<String, Long>> getByMonth() {
        return viewService.getViewsByMonth();
    }

    @GetMapping("/neighborhood")
    public ResponseEntity<Map<String, Long>> getByNeighborhood() {
        return viewService.getViewsByNeighborhood();
    }

    @GetMapping("/neighborhoodType")
    public ResponseEntity<Map<String, Long>> getByNeighborhoodType() {
        return viewService.getViewsByNeighborhoodType();
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Long>> getViewsByStatus() {
        return viewService.getViewsByStatus();
    }

    @GetMapping("/statusAndType")
    public ResponseEntity<Map<String, Map<String, Long>>> getViewsByStatusAndType() {
        return viewService.getViewsByStatusAndType();
    }

    @GetMapping("/operation")
    public ResponseEntity<Map<String, Long>> getByOperation() {
        return viewService.getViewsByOperation();
    }

    @GetMapping("/rooms")
    public ResponseEntity<Map<Float, Long>> getByRooms() {
        return viewService.getViewsByRooms();
    }

    @GetMapping("/amenity")
    public ResponseEntity<Map<String, Long>> getByAmenity() {
        return viewService.getViewsByAmenity();
    }
}
