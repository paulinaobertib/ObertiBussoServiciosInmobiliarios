package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Amenity;
import pi.ms_properties.repository.AmenityRepository;
import pi.ms_properties.service.interf.IAmenityService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AmenityService implements IAmenityService {

    private final AmenityRepository amenityRepository;

    @Override
    public ResponseEntity<String> createAmenity(String name) {
        try {
            if (name == null || name.isBlank()) {
                return ResponseEntity.badRequest().body("El nombre no puede estar vacío");
            }

            Amenity amenity = new Amenity();
            amenity.setName(name);
            amenityRepository.save(amenity);

            return ResponseEntity.ok("Se ha guardado correctamente el servicio");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido guardar el servicio" + e);
        }
    }

    @Override
    public ResponseEntity<String> deleteAmenity(Long id) {
        try {
            Optional<Amenity> amenity = amenityRepository.findById(id);

            if (amenity.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            amenityRepository.deleteById(id);
            return ResponseEntity.ok("Se ha eliminado el servicio correctamente");
        } catch (Exception e){
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido eliminar el servicio" + e);
        }
    }

    @Override
    public ResponseEntity<Amenity> updateAmenity(Amenity amenity) {
        try {
            Optional<Amenity> search = amenityRepository.findById(amenity.getId());

            if (search.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Amenity updated = amenityRepository.save(amenity);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Amenity>> getAll() {
        try {
            List<Amenity> amenities = amenityRepository.findAll();

            if (amenities.isEmpty()) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.ok(amenities);
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<Amenity> getById(Long id) {
        try {
            Optional<Amenity> amenity = amenityRepository.findById(id);
            return amenity.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<Amenity> getByName(String name) {
        try {
            Optional<Amenity> amenity = amenityRepository.findByName(name);
            return amenity.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
