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
import pi.ms_properties.service.interf.IMaintenanceService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MaintenanceService implements IMaintenanceService {

    private final IMaintenanceRepository maintenanceRepository;

    private final IPropertyRepository propertyRepository;

    private final ObjectMapper objectMapper;

    private Maintenance prepareMaintenanceEntity(MaintenanceDTO dto) {
        Maintenance maintenance = objectMapper.convertValue(dto, Maintenance.class);
        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new EntityNotFoundException("Property not found with ID: " + dto.getPropertyId()));
        maintenance.setProperty(property);
        return maintenance;
    }

    @Override
    public ResponseEntity<String> createMaintenance(MaintenanceDTO maintenanceDTO) {
        try {
            Maintenance maintenance = prepareMaintenanceEntity(maintenanceDTO);
            maintenanceRepository.save(maintenance);
            return ResponseEntity.ok("Se ha creado el mantenimiento");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<MaintenanceDTO> updateMaintenance(Long id, MaintenanceDTO maintenanceDTO) {
        try {
            Optional<Maintenance> exist = maintenanceRepository.findById(id);
            if (exist.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Maintenance maintenance = prepareMaintenanceEntity(maintenanceDTO);
            maintenance.setId(id);
            maintenanceRepository.save(maintenance);
            MaintenanceDTO updatedDTO = objectMapper.convertValue(maintenance, MaintenanceDTO.class);
            updatedDTO.setPropertyId(maintenance.getProperty().getId());
            return ResponseEntity.ok(updatedDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<String> deleteMaintenance(Long id) {
        try {
            Optional<Maintenance> maintenance = maintenanceRepository.findById(id);
            if (maintenance.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            maintenanceRepository.deleteById(id);
            return ResponseEntity.ok("Se ha eliminado el mantenimiento");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<MaintenanceDTO> getById(Long id) {
        try {
            Optional<Maintenance> maintenance = maintenanceRepository.findById(id);
            if (maintenance.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            MaintenanceDTO maintenanceDTO = objectMapper.convertValue(maintenance, MaintenanceDTO.class);
            maintenanceDTO.setPropertyId(maintenance.get().getProperty().getId());
            return ResponseEntity.ok(maintenanceDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<MaintenanceDTO>> getByPropertyId(Long id) {
        try {
            Optional<Property> property = propertyRepository.findById(id);
            if (property.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            List<Maintenance> maintenances = maintenanceRepository.findByPropertyId(id);
            List<MaintenanceDTO> maintenanceDTOS = maintenances.stream()
                    .map(maintenance -> new MaintenanceDTO(
                            maintenance.getDate(),
                            maintenance.getTitle(),
                            maintenance.getDescription(),
                            maintenance.getProperty().getId()
                    ))
                    .toList();
            return ResponseEntity.ok(maintenanceDTOS);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
