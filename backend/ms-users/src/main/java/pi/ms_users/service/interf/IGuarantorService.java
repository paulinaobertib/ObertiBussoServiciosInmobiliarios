package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.dto.ContractGuarantorGetDTO;
import pi.ms_users.dto.GuarantorDTO;
import pi.ms_users.dto.GuarantorGetDTO;

import java.util.List;

public interface IGuarantorService {
    ResponseEntity<String> create(GuarantorDTO guarantorDTO);

    ResponseEntity<String> update(GuarantorDTO guarantorDTO);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<GuarantorGetDTO> getById(Long id);

    ResponseEntity<List<GuarantorGetDTO>> getAll();

    ResponseEntity<List<GuarantorGetDTO>> getByContract(Long contractId);

    ResponseEntity<List<ContractGuarantorGetDTO>> getContractsByGuarantor(Long guarantorId);

    ResponseEntity<GuarantorGetDTO> getByEmail(String email);

    ResponseEntity<GuarantorGetDTO> getByPhone(String phone);

    ResponseEntity<String> addGuarantorToContract(Long guarantorId, Long contractId);

    ResponseEntity<String> removeGuarantorFromContract(Long guarantorId, Long contractId);

    ResponseEntity<List<GuarantorGetDTO>> search(String search);
}
