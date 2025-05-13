package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/property")
    public ResponseEntity<Map<String, Long>> getByProperty() {
        return viewService.getViewsByProperty();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/propertyType")
    public ResponseEntity<Map<String, Long>> getByPropertyType() {
        return viewService.getViewsByPropertyType();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/day")
    public ResponseEntity<Map<String, Long>> getByDay() {
        return viewService.getViewsByDay();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/month")
    public ResponseEntity<Map<String, Long>> getByMonth() {
        return viewService.getViewsByMonth();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/neighborhood")
    public ResponseEntity<Map<String, Long>> getByNeighborhood() {
        return viewService.getViewsByNeighborhood();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/neighborhoodType")
    public ResponseEntity<Map<String, Long>> getByNeighborhoodType() {
        return viewService.getViewsByNeighborhoodType();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/status")
    public ResponseEntity<Map<String, Long>> getViewsByStatus() {
        return viewService.getViewsByStatus();
    }

    @GetMapping("/statusAndType")
    public ResponseEntity<Map<String, Map<String, Long>>> getViewsByStatusAndType() {
        return viewService.getViewsByStatusAndType();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/operation")
    public ResponseEntity<Map<String, Long>> getByOperation() {
        return viewService.getViewsByOperation();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/rooms")
    public ResponseEntity<Map<Float, Long>> getByRooms() {
        return viewService.getViewsByRooms();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/amenity")
    public ResponseEntity<Map<String, Long>> getByAmenity() {
        return viewService.getViewsByAmenity();
    }
}
