package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.dto.MaintenanceDTO;
import pi.ms_properties.service.impl.MaintenanceService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping("/create")
    public ResponseEntity<String> createMaintenance(@RequestBody MaintenanceDTO maintenanceDTO) {
        return maintenanceService.createMaintenance(maintenanceDTO);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MaintenanceDTO> updateMaintenance(@PathVariable Long id, @RequestBody MaintenanceDTO maintenanceDTO) {
        return  maintenanceService.updateMaintenance(id, maintenanceDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteMaintenance(@PathVariable Long id) {
        return maintenanceService.deleteMaintenance(id);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<MaintenanceDTO> getById(@PathVariable Long id) {
        return maintenanceService.getById(id);
    }

    @GetMapping("/getByPropertyId/{id}")
    public ResponseEntity<List<MaintenanceDTO>> getByPropertyId(@PathVariable Long id) {
        return maintenanceService.getByPropertyId(id);
    }
}
