package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Status;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertySaveDTO;
import pi.ms_properties.dto.PropertySimpleDTO;
import pi.ms_properties.dto.PropertyUpdateDTO;

import java.util.List;

public interface IPropertyService {
    ResponseEntity<String> createProperty(PropertySaveDTO propertyDTO);

    ResponseEntity<String> deleteProperty(Long id);

    ResponseEntity<PropertyDTO> updateProperty(Long id, PropertyUpdateDTO propertyDTO);

    ResponseEntity<String> updateStatus(Long id, Status status);

    ResponseEntity<List<PropertyDTO>> getAll();

    ResponseEntity<List<PropertyDTO>> getAllUsers();

    ResponseEntity<PropertyDTO> getById(Long id);

    ResponseEntity<List<PropertyDTO>> getByTitle(String title);

    ResponseEntity<List<PropertyDTO>> getByStatus(Status status);

    ResponseEntity<List<PropertyDTO>> findBy(float priceFrom, float priceTo, float areaFrom, float areaTo, float coveredAreaFrom, float coveredAreaTo, float rooms, String operation, String type, List<String> amenities, String city, String neighborhood, String neighborhoodType, Boolean credit, Boolean financing);
    ResponseEntity<List<PropertyDTO>> findByTitleDescription(String value);

    // feign
    ResponseEntity<PropertySimpleDTO> getSimpleById(Long id);
}
