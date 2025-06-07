package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_properties.domain.Status;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertySaveDTO;
import pi.ms_properties.dto.PropertySimpleDTO;
import pi.ms_properties.dto.PropertyUpdateDTO;
import pi.ms_properties.service.impl.PropertyService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/property")
public class PropertyController {

    private final PropertyService propertyService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> createProperty(@RequestPart("data") PropertySaveDTO propertySaveDTO, @RequestPart("mainImage") MultipartFile mainImage, @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        propertySaveDTO.setMainImage(mainImage);
        propertySaveDTO.setImages(images);
        return propertyService.createProperty(propertySaveDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteProperty(@PathVariable Long id) {
        return propertyService.deleteProperty(id);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update/{id}")
    public ResponseEntity<PropertyDTO> updateProperty(@PathVariable Long id, @RequestPart("data") PropertyUpdateDTO propertyUpdateDTO, @RequestPart(value = "mainImage", required = false) MultipartFile mainImage) {
        propertyUpdateDTO.setMainImageUpdated(mainImage);
        return propertyService.updateProperty(id, propertyUpdateDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/status/{id}")
    public ResponseEntity<String> updatePropertyStatus(@PathVariable Long id, @RequestParam Status status) {
        return propertyService.updateStatus(id, status);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<PropertyDTO>> getAll() {
        return propertyService.getAll();
    }

    @GetMapping("/get")
    public ResponseEntity<List<PropertyDTO>> getAllUsers() {
        return propertyService.getAllUsers();
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<PropertyDTO> getById(@PathVariable Long id) {
        return propertyService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByStatus")
    public ResponseEntity<List<PropertyDTO>> getByStatus(@RequestParam Status status) {
        return propertyService.getByStatus(status);
    }

    @GetMapping("/search")
    public ResponseEntity<List<PropertyDTO>> searchProperties(@RequestParam(defaultValue = "0") float priceFrom, @RequestParam(defaultValue = "0") float priceTo, @RequestParam(defaultValue = "0") float areaFrom, @RequestParam(defaultValue = "0") float areaTo, @RequestParam(defaultValue = "0") float coveredAreaFrom, @RequestParam(defaultValue = "0") float coveredAreaTo, @RequestParam(defaultValue = "0") float rooms, @RequestParam(defaultValue = "") String operation, @RequestParam(defaultValue = "") String type, @RequestParam(defaultValue = "") List<String> amenities, @RequestParam(defaultValue = "") String city, @RequestParam(defaultValue = "") String neighborhood, @RequestParam(defaultValue = "") String neighborhoodType, @RequestParam(required = false) Boolean credit, @RequestParam(required = false) Boolean financing) {
        return propertyService.findBy(priceFrom, priceTo, areaFrom, areaTo, coveredAreaFrom, coveredAreaTo, rooms, operation, type, amenities, city, neighborhood, neighborhoodType, credit, financing);
    }

    @GetMapping("/text")
    public ResponseEntity<List<PropertyDTO>> searchBy(@RequestParam String value) {
        return propertyService.findByTitleDescription(value);
    }

    @GetMapping("/getSimple/{id}")
    public ResponseEntity<PropertySimpleDTO> getSimpleById(@PathVariable Long id) {
        return propertyService.getSimpleById(id);
    }
}
