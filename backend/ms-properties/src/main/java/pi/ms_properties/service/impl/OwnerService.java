package pi.ms_properties.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
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
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("El email '" + owner.getEmail() + "' ya existe");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body("Se ha guardado el propietario");
    }

    @Override
    public ResponseEntity<String> deleteOwner(Long id) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe el propietario con ID: " + id));

        ownerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Owner> updateOwner(Owner owner) {
        ownerRepository.findById(owner.getId())
                .orElseThrow(() -> new EntityNotFoundException("No existe el propietario con ID: " + owner.getId()));

        Owner updated = ownerRepository.save(owner);
        return ResponseEntity.ok(updated);
    }

    @Override
    public ResponseEntity<Owner> getByPropertyId(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe la propiedad con ID: " + id));

        Owner owner = ownerRepository.findById(property.getOwner().getId())
                .orElseThrow(() -> new EntityNotFoundException("No se encontró el propietario para la propiedad"));

        return ResponseEntity.ok(owner);
    }

    @Override
    public ResponseEntity<List<Owner>> getAll() {
        List<Owner> owners = ownerRepository.findAll();
        if (owners.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(owners);
    }

    @Override
    public ResponseEntity<Owner> getById(Long id) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe el propietario con ID: " + id));

        return ResponseEntity.ok(owner);
    }

    @Override
    public ResponseEntity<List<Owner>> findBy(String search) {
        Specification<Owner> specification = OwnerSpecification.textSearch(search);
        List<Owner> result = ownerRepository.findAll(specification);
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<List<ContractDTO>> findContracts(Long id) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado al propietario con ID: " + id));

        List<Property> properties = propertyRepository.findByOwner(id);
        List<ContractDTO> contractDTOS = new ArrayList<>();

        for (Property property : properties) {
            List<ContractDTO> contracts = contractRepository.findByPropertyId(property.getId());
            for (ContractDTO contract : contracts) {
                contractDTOS.add(getContractDTO(contract));
            }
        }

        return ResponseEntity.ok(contractDTOS);
    }
}
