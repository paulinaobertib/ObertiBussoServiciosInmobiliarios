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

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/property")
    public ResponseEntity<Map<String, Long>> getByProperty() {
        return viewService.getViewsByProperty();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/propertyType")
    public ResponseEntity<Map<String, Long>> getByPropertyType() {
        return viewService.getViewsByPropertyType();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/day")
    public ResponseEntity<Map<String, Long>> getByDay() {
        return viewService.getViewsByDay();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/month")
    public ResponseEntity<Map<String, Long>> getByMonth() {
        return viewService.getViewsByMonth();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/neighborhood")
    public ResponseEntity<Map<String, Long>> getByNeighborhood() {
        return viewService.getViewsByNeighborhood();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/neighborhoodType")
    public ResponseEntity<Map<String, Long>> getByNeighborhoodType() {
        return viewService.getViewsByNeighborhoodType();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/status")
    public ResponseEntity<Map<String, Long>> getViewsByStatus() {
        return viewService.getViewsByStatus();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/statusAndType")
    public ResponseEntity<Map<String, Map<String, Long>>> getViewsByStatusAndType() {
        return viewService.getViewsByStatusAndType();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/operation")
    public ResponseEntity<Map<String, Long>> getByOperation() {
        return viewService.getViewsByOperation();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/rooms")
    public ResponseEntity<Map<Float, Long>> getByRooms() {
        return viewService.getViewsByRooms();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/amenity")
    public ResponseEntity<Map<String, Long>> getByAmenity() {
        return viewService.getViewsByAmenity();
    }
}
