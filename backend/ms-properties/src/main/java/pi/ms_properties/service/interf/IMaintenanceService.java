package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_properties.dto.MaintenanceDTO;

import java.util.List;

public interface IMaintenanceService {

    ResponseEntity<String> createMaintenance(MaintenanceDTO maintenanceDTO);

    ResponseEntity<MaintenanceDTO> updateMaintenance(Long id, MaintenanceDTO maintenanceDTO);

    ResponseEntity<String> deleteMaintenance(Long id);

    ResponseEntity<MaintenanceDTO> getById(Long id);

    ResponseEntity<List<MaintenanceDTO>> getByPropertyId(Long id);
}
