package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;
import pi.ms_users.dto.ContractDTO;
import pi.ms_users.dto.ContractGetDTO;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.dto.feign.Status;

import java.time.LocalDate;
import java.util.List;

public interface IContractService {
    ResponseEntity<String> create(ContractDTO contractDTO);

    ResponseEntity<String> update(ContractDTO contractDTO);

    ResponseEntity<String> updateStatus(Long contractId);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<String> deleteByPropertyId(Long propertyId);

    ResponseEntity<String> deleteByUserId(String userId);

    ResponseEntity<ContractGetDTO> getById(Long id);

    ResponseEntity<List<ContractGetDTO>> getAll();

    ResponseEntity<List<ContractGetDTO>> getByUserId(String userId);

    ResponseEntity<List<ContractGetDTO>> getByStatus(ContractStatus status);

    ResponseEntity<List<ContractGetDTO>> getByType(ContractType type);

    ResponseEntity<List<ContractGetDTO>> getActiveContracts();

    ResponseEntity<List<ContractGetDTO>> getByProperty(Long propertyId);

    ResponseEntity<List<ContractSimpleDTO>> getByPropertyForMS(Long propertyId);

    ResponseEntity<List<ContractGetDTO>> getByDate(LocalDate date);

    ResponseEntity<List<ContractGetDTO>> getByDateRange(LocalDate from, LocalDate to);

    ResponseEntity<List<ContractGetDTO>> getContractsExpiringWithin(int days);

    ResponseEntity<List<ContractGetDTO>> getContractsEndingDate(LocalDate date);

    ResponseEntity<List<ContractGetDTO>> getContractsEndingBetween(LocalDate from, LocalDate to);

    ResponseEntity<String> updatePropertyStatusAndContract(Long propertyId, Long contractId, Status status);
}