package pi.ms_properties.serviceTest;

import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.InquiryStatus;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.InquirySaveDTO;
import pi.ms_properties.dto.feign.UserDTO;
import pi.ms_properties.repository.IInquiryRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.feign.UserRepository;
import pi.ms_properties.security.SecurityUtils;
import pi.ms_properties.service.impl.EmailService;
import pi.ms_properties.service.impl.InquiryService;
import pi.ms_properties.service.impl.SurveyService;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InquiryServiceTest {

    @InjectMocks
    private InquiryService inquiryService;

    @Mock
    private IInquiryRepository inquiryRepository;

    @Mock
    private IPropertyRepository propertyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private SurveyService surveyService;

    private InquirySaveDTO getSampleDTO() {
        return new InquirySaveDTO(1L, "user123", "123456789", "test@email.com", "John", "Doe", "Consulta", "Descripción", List.of(1L));
    }

    private Property getSampleProperty() {
        Property property = new Property();
        property.setId(1L);
        property.setTitle("Propiedad 1");
        property.setInquiries(new HashSet<>());
        return property;
    }

    private Inquiry getSampleInquiry() {
        Inquiry i = new Inquiry();
        i.setId(1L);
        i.setDate(LocalDateTime.now().minusHours(2));
        i.setDateClose(LocalDateTime.now());
        i.setEmail("test@email.com");
        i.setStatus(InquiryStatus.ABIERTA);
        return i;
    }

    // casos de exito

    @Test
    void create_withUser_success() {
        InquirySaveDTO dto = getSampleDTO();
        Property property = getSampleProperty();
        UserDTO userDTO = new UserDTO();
        userDTO.setUsername("user123");
        userDTO.setPhone("123456789");
        userDTO.setEmail("test@email.com");
        userDTO.setFirstName("John");
        userDTO.setLastName("Doe");

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(propertyRepository.findAllById(List.of(1L))).thenReturn(List.of(property));
        when(userRepository.exist("user123")).thenReturn(true);
        when(userRepository.findById("user123")).thenReturn(userDTO);

        ResponseEntity<String> response = inquiryService.create(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(emailService).sendEmailInquiry(any());
        verify(inquiryRepository).save(any());
    }

    @Test
    void create_withoutUser_success() {
        InquirySaveDTO dto = getSampleDTO();
        dto.setUserId(null);
        dto.setFirstName("Ana");
        dto.setLastName("García");
        dto.setPhone("987654321");
        dto.setEmail("ana@example.com");

        Property property = getSampleProperty();

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(propertyRepository.findAllById(List.of(1L))).thenReturn(List.of(property));

        ResponseEntity<String> response = inquiryService.create(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(emailService).sendEmailInquiry(any());
        verify(inquiryRepository).save(any());

        verify(userRepository, never()).findById(any());
        verify(userRepository, never()).exist(any());
    }

    @Test
    void getById_success() {
        Inquiry inquiry = getSampleInquiry();
        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(inquiry));

        ResponseEntity<Inquiry> response = inquiryService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(inquiry, response.getBody());
    }

    @Test
    void updateStatus_success() throws MessagingException {
        Inquiry inquiry = getSampleInquiry();

        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(inquiry));

        ResponseEntity<String> response = inquiryService.updateStatus(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(surveyService).sendSurvey(inquiry.getEmail(), inquiry.getId());
    }

    @Test
    void getAll_success() {
        List<Inquiry> mockList = List.of(new Inquiry(), new Inquiry());
        when(inquiryRepository.findAll()).thenReturn(mockList);

        ResponseEntity<List<Inquiry>> response = inquiryService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
    }

    @Test
    void getByUserId_success() {
        String userId = "user123";
        List<Inquiry> mockList = List.of(new Inquiry());

        when(userRepository.exist(userId)).thenReturn(true);
        when(inquiryRepository.getByUserId(userId)).thenReturn(mockList);

        ResponseEntity<List<Inquiry>> response = inquiryService.getByUserId(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getByPropertyId_success() {
        Long propertyId = 1L;
        Property mockProperty = new Property();
        List<Inquiry> mockList = List.of(new Inquiry(), new Inquiry());

        when(propertyRepository.findById(propertyId)).thenReturn(Optional.of(mockProperty));
        when(inquiryRepository.getByPropertyId(propertyId)).thenReturn(mockList);

        ResponseEntity<List<Inquiry>> response = inquiryService.getByPropertyId(propertyId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
    }

    @Test
    void testGetByStatus_Success() {
        InquiryStatus status = InquiryStatus.ABIERTA;
        List<Inquiry> mockList = List.of(new Inquiry(), new Inquiry());

        when(inquiryRepository.getByStatus(status)).thenReturn(mockList);

        ResponseEntity<List<Inquiry>> response = inquiryService.getByStatus(status);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockList, response.getBody());
        verify(inquiryRepository).getByStatus(status);
    }

    @Test
    void getInquiryStatusDistribution_success() {
        when(inquiryRepository.countByStatus()).thenReturn(List.of(
                new Object[]{"ABIERTA", 2L},
                new Object[]{"CERRADA", 1L}
        ));

        ResponseEntity<Map<String, Long>> response = inquiryService.getInquiryStatusDistribution();

        assertEquals(2, response.getBody().size());
        assertEquals(2L, response.getBody().get("ABIERTA"));
    }

    @Test
    void getAverageInquiryResponseTime_success() {
        Inquiry inquiry = getSampleInquiry();
        when(inquiryRepository.getByStatus(InquiryStatus.CERRADA)).thenReturn(List.of(inquiry));

        ResponseEntity<String> response = inquiryService.getAverageInquiryResponseTime();

        assertTrue(response.getBody().contains("horas"));
    }

    @Test
    void getInquiriesGroupedByDayOfWeek_success() {
        Inquiry inquiry1 = new Inquiry();
        inquiry1.setDate(LocalDateTime.of(2024, 5, 20, 10, 0));

        Inquiry inquiry2 = new Inquiry();
        inquiry2.setDate(LocalDateTime.of(2024, 5, 21, 15, 0));

        when(inquiryRepository.findAll()).thenReturn(List.of(inquiry1, inquiry2));

        ResponseEntity<Map<String, Long>> response = inquiryService.getInquiriesGroupedByDayOfWeek();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
        assertTrue(response.getBody().containsKey("lunes"));
        assertTrue(response.getBody().containsKey("martes"));
    }

    @Test
    void getInquiriesGroupedByTimeRange_success() {
        Inquiry morning = new Inquiry();
        morning.setDate(LocalDateTime.of(2024, 5, 20, 10, 0));

        Inquiry afternoon = new Inquiry();
        afternoon.setDate(LocalDateTime.of(2024, 5, 20, 15, 0));

        Inquiry night = new Inquiry();
        night.setDate(LocalDateTime.of(2024, 5, 20, 20, 0));

        when(inquiryRepository.findAll()).thenReturn(List.of(morning, afternoon, night));

        ResponseEntity<Map<String, Long>> response = inquiryService.getInquiriesGroupedByTimeRange();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(3, response.getBody().size());
        assertEquals(1L, response.getBody().get("Mañana"));
        assertEquals(1L, response.getBody().get("Tarde"));
        assertEquals(1L, response.getBody().get("Noche"));
    }

    @Test
    void getInquiriesPerMonth_success() {
        when(inquiryRepository.countPerMonth()).thenReturn(List.of(
                new Object[]{"2024-01", 5L},
                new Object[]{"2024-02", 3L}
        ));

        ResponseEntity<Map<YearMonth, Long>> response = inquiryService.getInquiriesPerMonth();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
        assertEquals(5L, response.getBody().get(YearMonth.of(2024, 1)));
        assertEquals(3L, response.getBody().get(YearMonth.of(2024, 2)));
    }

    @Test
    void getMostConsultedProperties_success() {
        when(inquiryRepository.countMostConsultedProperties()).thenReturn(List.of(
                new Object[]{"Propiedad 1", 3L},
                new Object[]{"Propiedad 2", 5L}
        ));

        ResponseEntity<Map<String, Long>> response = inquiryService.getMostConsultedProperties();

        assertEquals(2, response.getBody().size());
        assertEquals(5L, response.getBody().get("Propiedad 2"));
    }

    // casos de error

    @Test
    void create_propertyNotFound() {
        InquirySaveDTO dto = getSampleDTO();
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> inquiryService.create(dto));

        assertEquals("No se ha encontrado la propiedad con id 1", exception.getMessage());
    }

    @Test
    void create_genericException() {
        InquirySaveDTO dto = getSampleDTO();
        when(propertyRepository.findById(1L)).thenThrow(new RuntimeException("Error inesperado"));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> inquiryService.create(dto));

        assertEquals("Error inesperado", exception.getMessage());
    }

    @Test
    void testCreate_IllegalArgumentException() {
        InquirySaveDTO invalidDto = new InquirySaveDTO();
        invalidDto.setUserId(null);

        assertThrows(NullPointerException.class, () -> inquiryService.create(invalidDto));
    }

    @Test
    void testGetByStatus_IllegalArgumentException() {
        InquiryStatus status = InquiryStatus.ABIERTA;
        when(inquiryRepository.getByStatus(status)).thenThrow(new IllegalArgumentException());

        assertThrows(IllegalArgumentException.class, () -> inquiryService.getByStatus(status));
    }

    @Test
    void testGetByStatus_DataIntegrityViolationException() {
        InquiryStatus status = InquiryStatus.ABIERTA;
        when(inquiryRepository.getByStatus(status)).thenThrow(new DataIntegrityViolationException(""));

        assertThrows(DataIntegrityViolationException.class, () -> inquiryService.getByStatus(status));
    }

    @Test
    void testGetByStatus_GeneralException() {
        InquiryStatus status = InquiryStatus.ABIERTA;
        when(inquiryRepository.getByStatus(status)).thenThrow(new RuntimeException());

        assertThrows(RuntimeException.class, () -> inquiryService.getByStatus(status));
    }

    @Test
    void getById_notFound() {
        when(inquiryRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> inquiryService.getById(1L));

        assertEquals("Consulta no encontrada", exception.getMessage());
    }

    @Test
    void testGetById_DataIntegrityViolationException() {
        Long id = 1L;
        when(inquiryRepository.findById(id)).thenThrow(DataIntegrityViolationException.class);

        assertThrows(DataIntegrityViolationException.class, () -> inquiryService.getById(id));
    }

    @Test
    void testGetById_GeneralException() {
        Long id = 1L;
        when(inquiryRepository.findById(id)).thenThrow(RuntimeException.class);

        assertThrows(RuntimeException.class, () -> inquiryService.getById(id));
    }

    @Test
    void updateStatus_notFound() {
        when(inquiryRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> inquiryService.updateStatus(1L));

        assertEquals("No se ha encontrado la consulta", exception.getMessage());
    }

    @Test
    void testUpdateStatus_DataIntegrityViolationException() {
        Long id = 1L;
        Inquiry inquiry = new Inquiry();
        inquiry.setId(id);

        when(inquiryRepository.findById(id)).thenReturn(Optional.of(inquiry));
        doThrow(DataIntegrityViolationException.class).when(inquiryRepository).save(any(Inquiry.class));

        assertThrows(DataIntegrityViolationException.class, () -> inquiryService.updateStatus(id));
    }

    @Test
    void testUpdateStatus_GeneralException() {
        Long id = 1L;
        Inquiry inquiry = new Inquiry();
        inquiry.setId(id);

        when(inquiryRepository.findById(id)).thenReturn(Optional.of(inquiry));
        doThrow(RuntimeException.class).when(inquiryRepository).save(any(Inquiry.class));

        assertThrows(RuntimeException.class, () -> inquiryService.updateStatus(id));
    }

    @Test
    void getAll_dataIntegrityViolationException() {
        when(inquiryRepository.findAll()).thenThrow(new DataIntegrityViolationException("Error de integridad"));

        assertThrows(DataIntegrityViolationException.class, () -> inquiryService.getAll());
    }

    @Test
    void getAll_generalException() {
        when(inquiryRepository.findAll()).thenThrow(new RuntimeException("Error inesperado"));

        assertThrows(RuntimeException.class, () -> inquiryService.getAll());
    }

    @Test
    void getByUserId_userNotFound() {
        when(userRepository.exist("user123")).thenReturn(false);

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> inquiryService.getByUserId("user123"));

        assertEquals("Usuario no encontrado", exception.getMessage());
    }

    @Test
    void getByUserId_dataIntegrityViolationException() {
        when(userRepository.exist("user123")).thenReturn(true);
        when(inquiryRepository.getByUserId("user123"))
                .thenThrow(new DataIntegrityViolationException("Error de integridad"));

        assertThrows(DataIntegrityViolationException.class, () -> inquiryService.getByUserId("user123"));
    }

    @Test
    void getByUserId_generalException() {
        when(userRepository.exist("user123")).thenReturn(true);
        when(inquiryRepository.getByUserId("user123"))
                .thenThrow(new RuntimeException("Error inesperado"));

        assertThrows(RuntimeException.class, () -> inquiryService.getByUserId("user123"));
    }

    @Test
    void getByPropertyId_propertyNotFound() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> inquiryService.getByPropertyId(1L));

        assertEquals("Propiedad no encontrada", exception.getMessage());
    }

    @Test
    void getByPropertyId_dataIntegrityViolationException() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(new Property()));
        when(inquiryRepository.getByPropertyId(1L))
                .thenThrow(new DataIntegrityViolationException("Error de integridad"));

        assertThrows(DataIntegrityViolationException.class, () -> inquiryService.getByPropertyId(1L));
    }

    @Test
    void getByPropertyId_generalException() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(new Property()));
        when(inquiryRepository.getByPropertyId(1L))
                .thenThrow(new RuntimeException("Error inesperado"));

        assertThrows(RuntimeException.class, () -> inquiryService.getByPropertyId(1L));
    }

    @Test
    void getByUserId_withDifferentAuthenticatedUser_throwsAccessDenied() {
        String requestedUserId = "user123";
        String currentUserId = "otherUser";

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isAdmin).thenReturn(false);
            securityMock.when(SecurityUtils::isUser).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn(currentUserId);

            assertThrows(AccessDeniedException.class, () -> inquiryService.getByUserId(requestedUserId));
        }
    }

    @Test
    void getById_withDifferentAuthenticatedUser_throwsAccessDenied() {
        Inquiry inquiry = getSampleInquiry();
        inquiry.setUserId("user123");

        when(inquiryRepository.findById(1L)).thenReturn(Optional.of(inquiry));

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isAdmin).thenReturn(false);
            securityMock.when(SecurityUtils::isUser).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> inquiryService.getById(1L));
        }
    }

    @Test
    void create_withDifferentAuthenticatedUser_throwsAccessDenied() {
        InquirySaveDTO dto = getSampleDTO();
        dto.setUserId("user123");

        try (MockedStatic<SecurityUtils> securityMock = Mockito.mockStatic(SecurityUtils.class)) {
            securityMock.when(SecurityUtils::isUser).thenReturn(true);
            securityMock.when(SecurityUtils::getCurrentUserId).thenReturn("otherUser");

            assertThrows(AccessDeniedException.class, () -> inquiryService.create(dto));
        }
    }

    @Test
    void create_invalidInput_shouldThrowException() {
        InquirySaveDTO invalidDto = new InquirySaveDTO();

        assertThrows(NullPointerException.class, () -> inquiryService.create(invalidDto));
    }
}
