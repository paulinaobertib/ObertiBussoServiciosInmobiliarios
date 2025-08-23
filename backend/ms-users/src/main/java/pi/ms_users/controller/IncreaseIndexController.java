package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.IncreaseIndex;
import pi.ms_users.dto.ContractSimpleDTO;
import pi.ms_users.service.interf.IIncreaseIndexService;

import java.util.List;

@RestController
@RequestMapping("/increaseIndex")
@RequiredArgsConstructor
public class IncreaseIndexController {

    private final IIncreaseIndexService increaseIndexService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody IncreaseIndex increaseIndex) {
        return increaseIndexService.create(increaseIndex);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody IncreaseIndex increaseIndex) {
        return increaseIndexService.update(increaseIndex);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return increaseIndexService.delete(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<IncreaseIndex> getById(@PathVariable Long id) {
        return increaseIndexService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<IncreaseIndex>> getAll() {
        return increaseIndexService.getAll();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByName")
    public ResponseEntity<IncreaseIndex> getByName(@RequestParam String name) {
        return increaseIndexService.getByName(name);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByCode")
    public ResponseEntity<IncreaseIndex> getByCode(@RequestParam String code) {
        return increaseIndexService.getByCode(code);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/contracts/{id}")
    public ResponseEntity<List<ContractSimpleDTO>> getContractsByIncreaseIndex(@PathVariable Long id) {
        return increaseIndexService.getContractsByIncreaseIndex(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByContract/{contractId}")
    public ResponseEntity<IncreaseIndex> getByContract(@PathVariable Long contractId) {
        return increaseIndexService.getByContract(contractId);
    }
}

