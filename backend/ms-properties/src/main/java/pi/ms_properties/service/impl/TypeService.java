package pi.ms_properties.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Type;
import pi.ms_properties.repository.ITypeRepository;
import pi.ms_properties.service.interf.ITypeService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TypeService implements ITypeService {

    private final ITypeRepository typeRepository;

    @Override
    public ResponseEntity<String> createType(Type type) {
        if (type.getName() == null || type.getName().isBlank()) {
            return ResponseEntity.badRequest().body("El nombre no puede estar vacío");
        }

        typeRepository.save(type);
        return ResponseEntity.ok("Se ha guardado el tipo de propiedad");
    }

    @Override
    public ResponseEntity<String> deleteType(Long id) {
        Type type = typeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe ese tipo de propiedad"));

        typeRepository.delete(type);
        return ResponseEntity.ok("Se ha eliminado el tipo de propiedad");
    }

    @Override
    public ResponseEntity<Type> updateType(Type type) {
        typeRepository.findById(type.getId())
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el tipo con ID: " + type.getId()));

        Type updated = typeRepository.save(type);
        return ResponseEntity.ok(updated);
    }

    @Override
    public ResponseEntity<List<Type>> getAll() {
        List<Type> types = typeRepository.findAll();
        if (types.isEmpty()) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.ok(types);
        }
    }

    @Override
    public ResponseEntity<Type> getById(Long id) {
        Type type = typeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el tipo con ID: " + id));

        return ResponseEntity.ok(type);
    }
}
