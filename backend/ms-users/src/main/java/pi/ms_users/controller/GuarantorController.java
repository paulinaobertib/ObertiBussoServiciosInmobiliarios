package pi.ms_users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.dto.ContractGuarantorGetDTO;
import pi.ms_users.dto.GuarantorDTO;
import pi.ms_users.dto.GuarantorGetDTO;
import pi.ms_users.service.interf.IGuarantorService;

import java.util.List;

@RestController
@RequestMapping("/guarantors")
@RequiredArgsConstructor
public class GuarantorController {

    private final IGuarantorService guarantorService;

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody @Valid GuarantorDTO body) {
        return guarantorService.create(body);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestBody @Valid GuarantorDTO body) {
        body.setId(id);
        return guarantorService.update(body);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return guarantorService.delete(id);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<GuarantorGetDTO> getById(@PathVariable Long id) {
        return guarantorService.getById(id);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<GuarantorGetDTO>> getAll() {
        return guarantorService.getAll();
    }

    @GetMapping("/getByContract/{contractId}")
    public ResponseEntity<List<GuarantorGetDTO>> getByContract(@PathVariable Long contractId) {
        return guarantorService.getByContract(contractId);
    }

    @GetMapping("/getContracts/{guarantorId}")
    public ResponseEntity<List<ContractGuarantorGetDTO>> getContractsByGuarantor(@PathVariable Long guarantorId) {
        return guarantorService.getContractsByGuarantor(guarantorId);
    }

    @GetMapping("/getByEmail")
    public ResponseEntity<GuarantorGetDTO> getByEmail(@RequestParam String email) {
        return guarantorService.getByEmail(email);
    }

    @GetMapping("/getByPhone")
    public ResponseEntity<GuarantorGetDTO> getByPhone(@RequestParam String phone) {
        return guarantorService.getByPhone(phone);
    }

    @GetMapping("/search")
    public ResponseEntity<List<GuarantorGetDTO>> search(@RequestParam(name = "q") String query) {
        return guarantorService.search(query);
    }

    @PostMapping("/addContracts/{guarantorId}/{contractId}")
    public ResponseEntity<String> addGuarantorToContract(@PathVariable Long guarantorId, @PathVariable Long contractId) {
        return guarantorService.addGuarantorToContract(guarantorId, contractId);
    }

    @DeleteMapping("/removeContracts/{guarantorId}/{contractId}")
    public ResponseEntity<String> removeGuarantorFromContract(@PathVariable Long guarantorId, @PathVariable Long contractId) {
        return guarantorService.removeGuarantorFromContract(guarantorId, contractId);
    }
}