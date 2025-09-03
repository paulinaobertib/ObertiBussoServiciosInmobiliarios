package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.dto.ContractUtilityIncreaseDTO;
import pi.ms_users.dto.ContractUtilityIncreaseGetDTO;
import pi.ms_users.service.interf.IContractUtilityIncreaseService;

import java.util.List;

@RestController
@RequestMapping("/contractUtilityIncreases")
@RequiredArgsConstructor
public class ContractUtilityIncreaseController {

    private final IContractUtilityIncreaseService increaseService;

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody ContractUtilityIncreaseDTO dto) {
        return increaseService.create(dto);
    }

    @PutMapping("/update")
    public ResponseEntity<String> update(@RequestBody ContractUtilityIncreaseDTO dto) {
        return increaseService.update(dto);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return increaseService.delete(id);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<ContractUtilityIncreaseDTO> getById(@PathVariable Long id) {
        return increaseService.getById(id);
    }

    @GetMapping("/getByContractUtility/{contractUtilityId}")
    public ResponseEntity<List<ContractUtilityIncreaseGetDTO>> getByContractUtility(@PathVariable Long contractUtilityId) {
        return increaseService.getByContractUtility(contractUtilityId);
    }
}

