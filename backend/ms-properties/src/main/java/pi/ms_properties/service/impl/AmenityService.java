package pi.ms_properties.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Amenity;
import pi.ms_properties.repository.IAmenityRepository;
import pi.ms_properties.service.interf.IAmenityService;
import pi.ms_properties.specification.AmenitySpecification;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AmenityService implements IAmenityService {

    private final IAmenityRepository amenityRepository;

    @Override
    public ResponseEntity<String> createAmenity(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("El nombre no puede estar vacío");
        }

        if (amenityRepository.existsByName(name)) {
            throw new DataIntegrityViolationException("El servicio '" + name + "' ya existe");
        }

        Amenity amenity = new Amenity();
        amenity.setName(name);
        amenityRepository.save(amenity);

        return ResponseEntity.ok("Se ha guardado correctamente el servicio");
    }

    @Override
    public ResponseEntity<String> deleteAmenity(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el servicio con ID " + id));

        amenityRepository.deleteById(id);
        return ResponseEntity.ok("Se ha eliminado el servicio correctamente");
    }

    @Override
    public ResponseEntity<Amenity> updateAmenity(Amenity amenity) {
        if (!amenityRepository.existsById(amenity.getId())) {
            throw new EntityNotFoundException("No se encontró el servicio con ID " + amenity.getId());
        }

        Amenity updated = amenityRepository.save(amenity);
        return ResponseEntity.ok(updated);
    }

    @Override
    public ResponseEntity<List<Amenity>> getAll() {
        List<Amenity> amenities = amenityRepository.findAll();

        if (amenities.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(amenities);
    }

    @Override
    public ResponseEntity<Amenity> getById(Long id) {
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el servicio con ID " + id));

        return ResponseEntity.ok(amenity);
    }

    @Override
    public ResponseEntity<List<Amenity>> findBy(String search) {
        Specification<Amenity> specification = AmenitySpecification.textSearch(search);
        List<Amenity> result = amenityRepository.findAll(specification);
        return ResponseEntity.ok(result);
    }
}

