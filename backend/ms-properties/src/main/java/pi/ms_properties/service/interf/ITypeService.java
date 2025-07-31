package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Type;

import java.util.List;

public interface ITypeService {
    ResponseEntity<String> createType(Type type);

    ResponseEntity<String> deleteType(Long id);

    ResponseEntity<Type> updateType(Type type);

    ResponseEntity<List<Type>> getAll();

    ResponseEntity<Type> getById(Long id);

    ResponseEntity<List<Type>> findBy(String search);
}
