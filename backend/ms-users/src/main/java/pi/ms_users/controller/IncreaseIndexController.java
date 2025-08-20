package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody IncreaseIndex increaseIndex) {
        return increaseIndexService.create(increaseIndex);
    }

    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody IncreaseIndex increaseIndex) {
        return increaseIndexService.update(increaseIndex);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return increaseIndexService.delete(id);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<IncreaseIndex> getById(@PathVariable Long id) {
        return increaseIndexService.getById(id);
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<IncreaseIndex>> getAll() {
        return increaseIndexService.getAll();
    }

    @GetMapping("/getByName")
    public ResponseEntity<IncreaseIndex> getByName(@RequestParam String name) {
        return increaseIndexService.getByName(name);
    }

    @GetMapping("/getByCode")
    public ResponseEntity<IncreaseIndex> getByCode(@RequestParam String code) {
        return increaseIndexService.getByCode(code);
    }

    @GetMapping("/contracts/{id}")
    public ResponseEntity<List<ContractSimpleDTO>> getContractsByIncreaseIndex(@PathVariable Long id) {
        return increaseIndexService.getContractsByIncreaseIndex(id);
    }

    @GetMapping("/getByContract/{contractId}")
    public ResponseEntity<IncreaseIndex> getByContract(@PathVariable Long contractId) {
        return increaseIndexService.getByContract(contractId);
    }
}

