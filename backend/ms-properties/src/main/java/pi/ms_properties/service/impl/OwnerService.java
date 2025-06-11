package pi.ms_properties.service.impl;

import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionSystemException;
import pi.ms_properties.domain.Owner;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.feign.ContractDTO;
import pi.ms_properties.repository.IOwnerRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.feign.ContractRepository;
import pi.ms_properties.service.interf.IOwnerService;
import pi.ms_properties.specification.OwnerSpecification;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OwnerService implements IOwnerService {

    private final IOwnerRepository ownerRepository;

    private final IPropertyRepository propertyRepository;

    private final ContractRepository contractRepository;

    private static ContractDTO getContractDTO(ContractDTO contract) {
        ContractDTO contractDTO = new ContractDTO();
        contractDTO.setId(contract.getId());
        contractDTO.setPropertyId(contract.getPropertyId());
        contractDTO.setContractStatus(contract.getContractStatus());
        contractDTO.setContractType(contract.getContractType());
        contractDTO.setIncrease(contract.getIncrease());
        contractDTO.setStartDate(contract.getStartDate());
        contractDTO.setEndDate(contract.getEndDate());
        contractDTO.setUserId(contract.getUserId());
        contractDTO.setIncreaseFrequency(contract.getIncreaseFrequency());
        return contractDTO;
    }

    @Override
    public ResponseEntity<String> createOwner(Owner owner) {
        try {
            ownerRepository.save(owner);
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
            Optional<Owner> exist = ownerRepository.findById(id);

            if (exist.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            ownerRepository.deleteById(id);

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
            Optional<Owner> exist = ownerRepository.findById(owner.getId());

            if (exist.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            ownerRepository.save(owner);

            return ResponseEntity.ok(owner);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<Owner> getByPropertyId(Long id) {
        try {
            Optional<Property> property = propertyRepository.findById(id);

            if (property.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Optional<Owner> exist = ownerRepository.findById(property.get().getOwner().getId());

            return exist.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<List<Owner>> getAll() {
        try {
            List<Owner> owners = ownerRepository.findAll();

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
            Optional<Owner> owner = ownerRepository.findById(id);
            return owner.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Owner>> findBy(String search) {
        try {
            Specification<Owner> specification = OwnerSpecification.textSearch(search);
            List<Owner> find = ownerRepository.findAll(specification);
            return ResponseEntity.ok(find);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<?> findContracts(Long id) {
        try {
            Optional<Owner> owner = ownerRepository.findById(id);
            if (owner.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado al propietario");
            }
            List<Property> properties = propertyRepository.findByOwner(id);

            List<ContractDTO> contractDTOS = new ArrayList<>();

            for (Property property : properties) {
                List<ContractDTO> contracts = contractRepository.findByPropertyId(property.getId());

                for (ContractDTO contract : contracts) {
                    ContractDTO contractDTO = getContractDTO(contract);
                    contractDTOS.add(contractDTO);
                }
            }

            return ResponseEntity.ok(contractDTOS);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Violación de integridad de datos");
        } catch (ConstraintViolationException e) {
            return ResponseEntity.badRequest().body("Datos inválidos: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Argumento inválido: " + e.getMessage());
        } catch (TransactionSystemException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error en la transacción: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }
}
