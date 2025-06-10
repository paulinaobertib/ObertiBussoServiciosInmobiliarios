package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Owner;

import java.util.List;

public interface IOwnerService {
    ResponseEntity<String> createOwner(Owner owner);

    ResponseEntity<String> deleteOwner(Long id);

    ResponseEntity<Owner> updateOwner(Owner owner);

    ResponseEntity<Owner> getByPropertyId(Long id);

    ResponseEntity<List<Owner>> getAll();

    ResponseEntity<Owner> getById(Long id);

    ResponseEntity<List<Owner>> findBy(String search);

    ResponseEntity<?> findContracts(Long id);
}
