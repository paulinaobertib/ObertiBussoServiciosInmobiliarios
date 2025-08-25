package pi.ms_users.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.UtilityPeriodicityPayment;
import pi.ms_users.dto.ContractUtilityDTO;
import pi.ms_users.dto.ContractUtilityGetDTO;
import pi.ms_users.service.interf.IContractUtilityService;

import java.util.List;

@RestController
@RequestMapping("/contractUtilities")
@RequiredArgsConstructor
public class ContractUtilityController {

    private final IContractUtilityService contractUtilityService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody @Valid ContractUtilityDTO body) {
        return contractUtilityService.create(body);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody @Valid ContractUtilityDTO body) {
        return contractUtilityService.update(body);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return contractUtilityService.delete(id);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/deleteByContract/{contractId}")
    public ResponseEntity<String> deleteByContract(@PathVariable Long contractId) {
        return contractUtilityService.deleteByContract(contractId);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<ContractUtilityGetDTO> getById(@PathVariable Long id) {
        return contractUtilityService.getById(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByContract/{contractId}")
    public ResponseEntity<List<ContractUtilityGetDTO>> getByContract(@PathVariable Long contractId) {
        return contractUtilityService.getByContract(contractId);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByUtility/{utilityId}")
    public ResponseEntity<List<ContractUtilityGetDTO>> getByUtility(@PathVariable Long utilityId) {
        return contractUtilityService.getByUtility(utilityId);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByPeriodicity/{periodicity}")
    public ResponseEntity<List<ContractUtilityGetDTO>> getByPeriodicity(
            @PathVariable UtilityPeriodicityPayment periodicity) {
        return contractUtilityService.getByPeriodicity(periodicity);
    }
}

