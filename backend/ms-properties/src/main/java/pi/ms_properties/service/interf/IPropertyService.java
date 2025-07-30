package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Currency;
import pi.ms_properties.domain.Status;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertySaveDTO;
import pi.ms_properties.dto.PropertySimpleDTO;
import pi.ms_properties.dto.PropertyUpdateDTO;

import java.math.BigDecimal;
import java.util.List;

public interface IPropertyService {
    ResponseEntity<String> createProperty(PropertySaveDTO propertyDTO);

    ResponseEntity<String> deleteProperty(Long id);

    ResponseEntity<PropertyDTO> updateProperty(Long id, PropertyUpdateDTO propertyDTO);

    ResponseEntity<String> updateStatus(Long id, Status status);

    ResponseEntity<String> updateOutstanding(Long id, Boolean outstanding);

    ResponseEntity<List<PropertyDTO>> getAll();

    ResponseEntity<List<PropertyDTO>> getAllUsers();

    ResponseEntity<PropertyDTO> getById(Long id);

    ResponseEntity<List<PropertyDTO>> getByStatus(Status status);

    ResponseEntity<List<PropertyDTO>> findBy(BigDecimal priceFrom, BigDecimal priceTo, float areaFrom, float areaTo, float coveredAreaFrom, float coveredAreaTo, List<Float> rooms, String operation, List<String> types, List<String> amenities, List<String> cities, List<String> neighborhoods, List<String> neighborhoodTypes, Boolean credit, Boolean financing, Currency currency);

    ResponseEntity<List<PropertyDTO>> findByTitleDescription(String value);

    // feign
    ResponseEntity<PropertySimpleDTO> getSimpleById(Long id);
}
