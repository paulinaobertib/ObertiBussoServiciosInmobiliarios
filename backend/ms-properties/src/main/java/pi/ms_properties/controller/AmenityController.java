package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Amenity;
import pi.ms_properties.service.impl.AmenityService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/amenity")
public class AmenityController {

    private final AmenityService amenityService;

    @PostMapping("/create")
    public ResponseEntity<String> createAmenity(@RequestParam String name) {
        return amenityService.createAmenity(name);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteAmenity(@PathVariable Long id) {
        return amenityService.deleteAmenity(id);
    }

    @PutMapping("/update")
    public ResponseEntity<Amenity> updateAmenity(@RequestBody Amenity amenity) {
        return amenityService.updateAmenity(amenity);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Amenity>> getAll() {
        return amenityService.getAll();
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<Amenity> getById(@PathVariable Long id) {
        return amenityService.getById(id);
    }

    @GetMapping("getByName")
    public ResponseEntity<Amenity> getByName(@RequestParam String name) {
        return amenityService.getByName(name);
    }
}
