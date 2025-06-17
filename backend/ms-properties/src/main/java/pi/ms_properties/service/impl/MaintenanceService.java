package pi.ms_properties.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Maintenance;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.MaintenanceDTO;
import pi.ms_properties.repository.IMaintenanceRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.security.SecurityUtils;
import pi.ms_properties.service.interf.IMaintenanceService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService implements IMaintenanceService {

    private final IMaintenanceRepository maintenanceRepository;
    private final IPropertyRepository propertyRepository;
    private final ObjectMapper objectMapper;

    private Maintenance prepareMaintenanceEntity(MaintenanceDTO dto) {
        Maintenance maintenance = objectMapper.convertValue(dto, Maintenance.class);
        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new EntityNotFoundException("Propiedad no encontrada con ID: " + dto.getPropertyId()));
        maintenance.setProperty(property);
        return maintenance;
    }

    @Override
    public ResponseEntity<String> createMaintenance(MaintenanceDTO maintenanceDTO) {
        Maintenance maintenance = prepareMaintenanceEntity(maintenanceDTO);
        maintenanceRepository.save(maintenance);
        return ResponseEntity.ok("Se ha creado el mantenimiento");
    }

    @Override
    public ResponseEntity<MaintenanceDTO> updateMaintenance(Long id, MaintenanceDTO maintenanceDTO) {
        Maintenance existing = maintenanceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mantenimiento no encontrado con ID: " + id));

        Maintenance updated = prepareMaintenanceEntity(maintenanceDTO);
        updated.setId(id);
        maintenanceRepository.save(updated);

        MaintenanceDTO updatedDTO = objectMapper.convertValue(updated, MaintenanceDTO.class);
        updatedDTO.setPropertyId(updated.getProperty().getId());
        return ResponseEntity.ok(updatedDTO);
    }

    @Override
    public ResponseEntity<String> deleteMaintenance(Long id) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mantenimiento no encontrado con ID: " + id));

        maintenanceRepository.deleteById(id);
        return ResponseEntity.ok("Se ha eliminado el mantenimiento");
    }

    @Override
    public ResponseEntity<MaintenanceDTO> getById(Long id) {
        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mantenimiento no encontrado con ID: " + id));

        MaintenanceDTO maintenanceDTO = objectMapper.convertValue(maintenance, MaintenanceDTO.class);
        maintenanceDTO.setPropertyId(maintenance.getProperty().getId());
        return ResponseEntity.ok(maintenanceDTO);
    }

    @Override
    public ResponseEntity<List<MaintenanceDTO>> getByPropertyId(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Propiedad no encontrada con ID: " + id));

        List<Maintenance> maintenances = maintenanceRepository.findByPropertyId(id);
        List<MaintenanceDTO> maintenanceDTOS = maintenances.stream()
                .map(m -> new MaintenanceDTO(
                        m.getId(),
                        m.getDate(),
                        m.getTitle(),
                        m.getDescription(),
                        m.getProperty().getId()
                ))
                .toList();
        return ResponseEntity.ok(maintenanceDTOS);
    }
}

