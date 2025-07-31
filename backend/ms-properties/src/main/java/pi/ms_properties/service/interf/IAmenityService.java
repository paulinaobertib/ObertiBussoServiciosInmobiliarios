package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Amenity;

import java.util.List;

public interface IAmenityService {
    ResponseEntity<String> createAmenity(String name);

    ResponseEntity<String> deleteAmenity(Long id);

    ResponseEntity<Amenity> updateAmenity(Amenity amenity);

    ResponseEntity<List<Amenity>> getAll();

    ResponseEntity<Amenity> getById(Long id);

    ResponseEntity<List<Amenity>> findBy(String search);
}
