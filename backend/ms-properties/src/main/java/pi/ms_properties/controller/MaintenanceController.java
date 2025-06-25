package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.dto.MaintenanceDTO;
import pi.ms_properties.service.interf.IMaintenanceService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/maintenance")
public class MaintenanceController {

    private final IMaintenanceService maintenanceService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<String> createMaintenance(@RequestBody MaintenanceDTO maintenanceDTO) {
        return maintenanceService.createMaintenance(maintenanceDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update/{id}")
    public ResponseEntity<MaintenanceDTO> updateMaintenance(@PathVariable Long id, @RequestBody MaintenanceDTO maintenanceDTO) {
        return  maintenanceService.updateMaintenance(id, maintenanceDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteMaintenance(@PathVariable Long id) {
        return maintenanceService.deleteMaintenance(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<MaintenanceDTO> getById(@PathVariable Long id) {
        return maintenanceService.getById(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'tenant')")
    @GetMapping("/getByPropertyId/{id}")
    public ResponseEntity<List<MaintenanceDTO>> getByPropertyId(@PathVariable Long id) {
        return maintenanceService.getByPropertyId(id);
    }
}
