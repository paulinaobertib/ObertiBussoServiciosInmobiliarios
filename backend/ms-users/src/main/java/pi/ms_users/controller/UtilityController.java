package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.dto.UtilityDTO;
import pi.ms_users.service.interf.IUtilityService;

import java.util.List;

@RestController
@RequestMapping("/utilities")
@RequiredArgsConstructor
public class UtilityController {

    private final IUtilityService utilityService;

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody UtilityDTO dto) {
        return utilityService.create(dto);
    }

    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody UtilityDTO dto) {
        return utilityService.update(dto);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return utilityService.delete(id);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<UtilityDTO> getById(@PathVariable Long id) {
        return utilityService.getById(id);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<UtilityDTO>> getAll() {
        return utilityService.getAll();
    }

    @GetMapping("/getByName")
    public ResponseEntity<UtilityDTO> getByName(@RequestParam String name) {
        return utilityService.getByName(name);
    }

    @GetMapping("/contracts/{id}")
    public ResponseEntity<List<ContractSimpleDTO>> getContractsByUtility(@PathVariable Long id) {
        return utilityService.getContractsByUtility(id);
    }

    @GetMapping("/getByContract/{contractId}")
    public ResponseEntity<List<UtilityDTO>> getByContract(@PathVariable Long contractId) {
        return utilityService.getByContract(contractId);
    }
}

