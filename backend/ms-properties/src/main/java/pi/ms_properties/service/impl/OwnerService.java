package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Owner;
import pi.ms_properties.domain.Property;
import pi.ms_properties.repository.IOwnerRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.service.interf.IOwnerService;
import pi.ms_properties.specification.OwnerSpecification;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OwnerService implements IOwnerService {

    private final IOwnerRepository IOwnerRepository;

    private final IPropertyRepository IPropertyRepository;

    @Override
    public ResponseEntity<String> createOwner(Owner owner) {
        try {
            IOwnerRepository.save(owner);
            return ResponseEntity.status(HttpStatus.CREATED).body("Se ha guardado el propietario");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("El mail '" + owner.getMail() + "' ya existe");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido guardar el propietario" + e);
        }
    }

    @Override
    public ResponseEntity<String> deleteOwner(Long id) {
        try {
            Optional<Owner> exist = IOwnerRepository.findById(id);

            if (exist.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            IOwnerRepository.deleteById(id);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido eliminar el propietario" + e);
        }
    }

    @Override
    public ResponseEntity<Owner> updateOwner(Owner owner) {
        try {
            Optional<Owner> exist = IOwnerRepository.findById(owner.getId());

            if (exist.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            IOwnerRepository.save(owner);

            return ResponseEntity.ok(owner);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<Owner> getByPropertyId(Long id) {
        try {
            Optional<Property> property = IPropertyRepository.findById(id);

            if (property.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Optional<Owner> exist = IOwnerRepository.findById(property.get().getOwner().getId());

            return exist.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<List<Owner>> getAll() {
        try {
            List<Owner> owners = IOwnerRepository.findAll();

            if (owners.isEmpty()) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.ok(owners);
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<Owner> getById(Long id) {
        try {
            Optional<Owner> owner = IOwnerRepository.findById(id);
            return owner.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Owner>> findBy(String search) {
        try {
            Specification<Owner> specification = OwnerSpecification.textSearch(search);
            List<Owner> find = IOwnerRepository.findAll(specification);
            return ResponseEntity.ok(find);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
