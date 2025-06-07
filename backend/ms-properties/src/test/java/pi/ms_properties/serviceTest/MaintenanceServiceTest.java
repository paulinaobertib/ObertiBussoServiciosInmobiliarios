package pi.ms_properties.serviceTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Maintenance;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.MaintenanceDTO;
import pi.ms_properties.repository.IMaintenanceRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.service.impl.MaintenanceService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @InjectMocks
    private MaintenanceService maintenanceService;

    @Mock
    private IMaintenanceRepository maintenanceRepository;

    @Mock
    private IPropertyRepository propertyRepository;

    @Mock
    private ObjectMapper objectMapper;

    private MaintenanceDTO sampleDto;

    private Maintenance sampleEntity;

    private Property sampleProperty;

    @BeforeEach
    void setUp() {
        sampleProperty = new Property();
        sampleProperty.setId(1L);

        sampleDto = new MaintenanceDTO(1L, LocalDateTime.now(), "Title", "Desc", 1L);

        sampleEntity = new Maintenance();
        sampleEntity.setId(1L);
        sampleEntity.setDate(sampleDto.getDate());
        sampleEntity.setTitle("Title");
        sampleEntity.setDescription("Desc");
        sampleEntity.setProperty(sampleProperty);
    }

    // casos de exito

    @Test
    void testCreateMaintenance_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));
        when(objectMapper.convertValue(sampleDto, Maintenance.class)).thenReturn(sampleEntity);

        ResponseEntity<String> response = maintenanceService.createMaintenance(sampleDto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha creado el mantenimiento", response.getBody());
        verify(maintenanceRepository).save(sampleEntity);
    }

    @Test
    void testUpdateMaintenance_Success() {
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(sampleEntity));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));
        when(objectMapper.convertValue(sampleDto, Maintenance.class)).thenReturn(sampleEntity);
        when(objectMapper.convertValue(sampleEntity, MaintenanceDTO.class)).thenReturn(sampleDto);

        ResponseEntity<MaintenanceDTO> response = maintenanceService.updateMaintenance(1L, sampleDto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(sampleDto, response.getBody());
        verify(maintenanceRepository).save(sampleEntity);
    }

    @Test
    void testDeleteMaintenance_Success() {
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(sampleEntity));

        ResponseEntity<String> response = maintenanceService.deleteMaintenance(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado el mantenimiento", response.getBody());
        verify(maintenanceRepository).deleteById(1L);
    }

    @Test
    void testGetById_Success() {
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(sampleEntity));
        when(objectMapper.convertValue(Optional.of(sampleEntity), MaintenanceDTO.class)).thenReturn(sampleDto);

        ResponseEntity<MaintenanceDTO> response = maintenanceService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(sampleDto.getId(), response.getBody().getId());
    }

    @Test
    void testGetByPropertyId_Success() {
        List<Maintenance> maintenances = List.of(sampleEntity);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));
        when(maintenanceRepository.findByPropertyId(1L)).thenReturn(maintenances);

        ResponseEntity<List<MaintenanceDTO>> response = maintenanceService.getByPropertyId(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals(sampleEntity.getId(), response.getBody().getFirst().getId());
    }

    // casos de error

    @Test
    void testCreateMaintenance_PropertyNotFound() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());
        when(objectMapper.convertValue(sampleDto, Maintenance.class)).thenReturn(sampleEntity);

        ResponseEntity<String> response = maintenanceService.createMaintenance(sampleDto);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testUpdateMaintenance_NotFound() {
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<MaintenanceDTO> response = maintenanceService.updateMaintenance(1L, sampleDto);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testDeleteMaintenance_NotFound() {
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = maintenanceService.deleteMaintenance(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testGetById_NotFound() {
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<MaintenanceDTO> response = maintenanceService.getById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testGetByPropertyId_PropertyNotFound() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<List<MaintenanceDTO>> response = maintenanceService.getByPropertyId(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testCreateMaintenance_InternalError() {
        when(propertyRepository.findById(1L)).thenThrow(new RuntimeException("DB down"));

        ResponseEntity<String> response = maintenanceService.createMaintenance(sampleDto);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testUpdateMaintenance_InternalError() {
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(sampleEntity));
        when(propertyRepository.findById(1L)).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<MaintenanceDTO> response = maintenanceService.updateMaintenance(1L, sampleDto);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testDeleteMaintenance_InternalError() {
        when(maintenanceRepository.findById(1L)).thenReturn(Optional.of(sampleEntity));
        doThrow(new RuntimeException("Failed")).when(maintenanceRepository).deleteById(1L);

        ResponseEntity<String> response = maintenanceService.deleteMaintenance(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testGetById_InternalError() {
        when(maintenanceRepository.findById(1L)).thenThrow(new RuntimeException("Unexpected"));

        ResponseEntity<MaintenanceDTO> response = maintenanceService.getById(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testGetByPropertyId_InternalError() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));
        when(maintenanceRepository.findByPropertyId(1L)).thenThrow(new RuntimeException("Error"));

        ResponseEntity<List<MaintenanceDTO>> response = maintenanceService.getByPropertyId(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}

