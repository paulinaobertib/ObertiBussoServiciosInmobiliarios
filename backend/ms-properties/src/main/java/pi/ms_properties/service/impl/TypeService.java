package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Type;
import pi.ms_properties.repository.TypeRepository;
import pi.ms_properties.service.interf.ITypeService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TypeService implements ITypeService {

    public final TypeRepository typeRepository;

    @Override
    public ResponseEntity<String> createType(Type type) {
        try {
            if (type.getName() == null || type.getName().isBlank()) {
                return ResponseEntity.badRequest().body("El nombre no puede estar vacio");
            }
            typeRepository.save(type);
            return ResponseEntity.ok("Se ha guardado el tipo de propiedad");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("El tipo '" + type.getName() + "' ya existe");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido guardar el tipo de propiedad" + e);
        }
    }

    @Override
    public ResponseEntity<String> deleteType(Long id) {
        try {

            Optional<Type> type = typeRepository.findById(id);

            if (type.isEmpty()) {
                return ResponseEntity.badRequest().body("No existe ese tipo de propiedad");
            }

            typeRepository.delete(type.get());
            return ResponseEntity.ok("Se ha eliminado el tipo de propiedad");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido eliminar el tipo de propiedad" + e);
        }
    }

    @Override
    public ResponseEntity<Type> updateType(Type type) {
        try {
            Optional<Type> search = typeRepository.findById(type.getId());

            if (search.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Type updated = typeRepository.save(type);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Type>> getAll() {
        try {
            List<Type> types = typeRepository.findAll();

            if (types.isEmpty()) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.ok(types);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<Type> getById(Long id) {
        try {
            Optional<Type> type = typeRepository.findById(id);
            return type.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
