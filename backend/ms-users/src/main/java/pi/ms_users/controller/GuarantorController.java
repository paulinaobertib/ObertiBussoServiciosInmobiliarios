package pi.ms_users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody @Valid GuarantorDTO body) {
        return guarantorService.create(body);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestBody @Valid GuarantorDTO body) {
        body.setId(id);
        return guarantorService.update(body);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return guarantorService.delete(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<GuarantorGetDTO> getById(@PathVariable Long id) {
        return guarantorService.getById(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getAll")
    public ResponseEntity<List<GuarantorGetDTO>> getAll() {
        return guarantorService.getAll();
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByContract/{contractId}")
    public ResponseEntity<List<GuarantorGetDTO>> getByContract(@PathVariable Long contractId) {
        return guarantorService.getByContract(contractId);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getContracts/{guarantorId}")
    public ResponseEntity<List<ContractGuarantorGetDTO>> getContractsByGuarantor(@PathVariable Long guarantorId) {
        return guarantorService.getContractsByGuarantor(guarantorId);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByEmail")
    public ResponseEntity<GuarantorGetDTO> getByEmail(@RequestParam String email) {
        return guarantorService.getByEmail(email);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByPhone")
    public ResponseEntity<GuarantorGetDTO> getByPhone(@RequestParam String phone) {
        return guarantorService.getByPhone(phone);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/search")
    public ResponseEntity<List<GuarantorGetDTO>> search(@RequestParam(name = "q") String query) {
        return guarantorService.search(query);
    }

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/addContracts/{guarantorId}/{contractId}")
    public ResponseEntity<String> addGuarantorToContract(@PathVariable Long guarantorId, @PathVariable Long contractId) {
        return guarantorService.addGuarantorToContract(guarantorId, contractId);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/removeContracts/{guarantorId}/{contractId}")
    public ResponseEntity<String> removeGuarantorFromContract(@PathVariable Long guarantorId, @PathVariable Long contractId) {
        return guarantorService.removeGuarantorFromContract(guarantorId, contractId);
    }
}