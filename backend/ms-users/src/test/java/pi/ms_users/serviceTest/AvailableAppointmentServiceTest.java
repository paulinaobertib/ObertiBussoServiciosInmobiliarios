package pi.ms_users.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatcher;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.AvailableAppointment;
import pi.ms_users.dto.AvailableAppointmentDTO;
import pi.ms_users.repository.IAvailableAppointmentRepository;
import pi.ms_users.service.impl.AvailableAppointmentService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvailableAppointmentServiceTest {

    @Mock
    private IAvailableAppointmentRepository availableAppointmentRepository;

    @InjectMocks
    private AvailableAppointmentService availableAppointmentService;

    // casos de exito

    @Test
    void create_shouldSaveAppointmentsEvery30Minutes() {
        AvailableAppointmentDTO dto = new AvailableAppointmentDTO();
        dto.setDate(LocalDate.of(2025, 6, 30));
        dto.setStartTime(LocalTime.of(9, 0));
        dto.setEndTime(LocalTime.of(10, 0));

        when(availableAppointmentRepository.findByDateIn(anyList()))
                .thenReturn(Collections.emptyList());

        ResponseEntity<String> response = availableAppointmentService.create(dto);

        ArgumentCaptor<List<AvailableAppointment>> captor = ArgumentCaptor.forClass(List.class);
        verify(availableAppointmentRepository).saveAll(captor.capture());

        List<AvailableAppointment> saved = captor.getValue();
        assertEquals(2, saved.size());
        assertTrue(saved.getFirst().getAvailability());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se han guardado los nuevos turnos.", response.getBody());
    }

    @Test
    void create_shouldReturnMessageIfAppointmentsAlreadyExist() {
        AvailableAppointmentDTO dto = new AvailableAppointmentDTO();
        dto.setDate(LocalDate.of(2025, 6, 30));
        dto.setStartTime(LocalTime.of(9, 0));
        dto.setEndTime(LocalTime.of(10, 0));

        List<AvailableAppointment> existing = List.of(
                new AvailableAppointment(1L, LocalDateTime.of(dto.getDate(), LocalTime.of(9, 0)), true),
                new AvailableAppointment(2L, LocalDateTime.of(dto.getDate(), LocalTime.of(9, 30)), true)
        );

        when(availableAppointmentRepository.findByDateIn(anyList())).thenReturn(existing);

        ResponseEntity<String> response = availableAppointmentService.create(dto);

        verify(availableAppointmentRepository, never()).saveAll(any());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Los turnos ya existian.", response.getBody());
    }

    @Test
    void create_shouldSaveOnlyNewAppointmentsIfSomeExist() {
        AvailableAppointmentDTO dto = new AvailableAppointmentDTO();
        dto.setDate(LocalDate.of(2025, 6, 30));
        dto.setStartTime(LocalTime.of(9, 0));
        dto.setEndTime(LocalTime.of(10, 30));

        List<AvailableAppointment> existing = List.of(
                new AvailableAppointment(1L, LocalDateTime.of(dto.getDate(), LocalTime.of(9, 0)), true)
        );

        when(availableAppointmentRepository.findByDateIn(anyList())).thenReturn(existing);

        ResponseEntity<String> response = availableAppointmentService.create(dto);

        verify(availableAppointmentRepository).saveAll(argThat((ArgumentMatcher<List<AvailableAppointment>>) list -> list.size() == 2));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().contains("Turnos ya existentes: 1. Turnos nuevos guardados:"));
        assertTrue(response.getBody().contains("30/06/2025 09:30"));
        assertTrue(response.getBody().contains("30/06/2025 10:00"));
    }

    @Test
    void updateAvailability_shouldToggleAvailability_whenFound() {
        AvailableAppointment appt = new AvailableAppointment();
        appt.setId(1L);
        appt.setAvailability(true);

        when(availableAppointmentRepository.findById(1L)).thenReturn(Optional.of(appt));

        ResponseEntity<String> response = availableAppointmentService.updateAvailability(1L);

        assertFalse(appt.getAvailability());
        verify(availableAppointmentRepository).save(appt);
        assertEquals("Disponibilidad actualizada.", response.getBody());
    }

    @Test
    void deleteAvailability_shouldDelete_whenFound() {
        AvailableAppointment appt = new AvailableAppointment();
        appt.setId(1L);

        when(availableAppointmentRepository.findById(1L)).thenReturn(Optional.of(appt));

        ResponseEntity<String> response = availableAppointmentService.deleteAvailability(1L);

        verify(availableAppointmentRepository).delete(appt);
        assertEquals("Se ha eliminado la disponibilidad.", response.getBody());
    }

    @Test
    void getById_shouldReturnAppointment_whenFound() {
        AvailableAppointment appt = new AvailableAppointment();
        appt.setId(5L);

        when(availableAppointmentRepository.findById(5L)).thenReturn(Optional.of(appt));

        ResponseEntity<AvailableAppointment> response = availableAppointmentService.getById(5L);

        assertEquals(5L, response.getBody().getId());
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getAll_shouldReturnList() {
        AvailableAppointment a1 = new AvailableAppointment();
        AvailableAppointment a2 = new AvailableAppointment();

        when(availableAppointmentRepository.findAll()).thenReturn(List.of(a1, a2));

        ResponseEntity<List<AvailableAppointment>> response = availableAppointmentService.getAll();

        assertEquals(2, response.getBody().size());
    }

    @Test
    void availableAppointments_shouldReturnEnabledList() {
        when(availableAppointmentRepository.findTrueAvailability()).thenReturn(List.of(new AvailableAppointment()));

        ResponseEntity<List<AvailableAppointment>> response = availableAppointmentService.availableAppointments();

        assertEquals(1, response.getBody().size());
    }

    @Test
    void noAvailableAppointments_shouldReturnDisabledList() {
        when(availableAppointmentRepository.findFalseAvailability()).thenReturn(List.of(new AvailableAppointment()));

        ResponseEntity<List<AvailableAppointment>> response = availableAppointmentService.noAvailableAppointments();

        assertEquals(1, response.getBody().size());
    }

    // casos de error

    @Test
    void create_shouldReturnBadRequestIfTimeRangeIsInvalid() {
        AvailableAppointmentDTO dto = new AvailableAppointmentDTO();
        dto.setDate(LocalDate.of(2025, 6, 30));
        dto.setStartTime(LocalTime.of(10, 0));
        dto.setEndTime(LocalTime.of(9, 0)); // inválido

        ResponseEntity<String> response = availableAppointmentService.create(dto);

        verify(availableAppointmentRepository, never()).saveAll(any());

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("El horario de inicio debe ser anterior al horario de fin.", response.getBody());
    }

    @Test
    void create_shouldReturnNoAppointmentsMessageIfNoTurnSlots() {
        AvailableAppointmentDTO dto = new AvailableAppointmentDTO();
        dto.setDate(LocalDate.of(2025, 6, 30));
        dto.setStartTime(LocalTime.of(10, 0));
        dto.setEndTime(LocalTime.of(10, 0));

        ResponseEntity<String> response = availableAppointmentService.create(dto);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("El horario de inicio debe ser anterior al horario de fin.", response.getBody());
    }

    @Test
    void updateAvailability_shouldThrow_whenNotFound() {
        when(availableAppointmentRepository.findById(99L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
                availableAppointmentService.updateAvailability(99L));

        assertEquals("No se ha encontrado disponibilidad.", ex.getMessage());
    }

    @Test
    void deleteAvailability_shouldThrow_whenNotFound() {
        when(availableAppointmentRepository.findById(88L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
                availableAppointmentService.deleteAvailability(88L));

        assertEquals("No se ha encontrado disponibilidad.", ex.getMessage());
    }

    @Test
    void getById_shouldThrow_whenNotFound() {
        when(availableAppointmentRepository.findById(77L)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () ->
                availableAppointmentService.getById(77L));

        assertEquals("No se ha encontrado disponibilidad.", ex.getMessage());
    }
}
