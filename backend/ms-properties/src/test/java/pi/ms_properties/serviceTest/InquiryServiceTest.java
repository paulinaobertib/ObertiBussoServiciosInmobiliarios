package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.InquiryStatus;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.InquirySaveDTO;
import pi.ms_properties.dto.feign.UserDTO;
import pi.ms_properties.repository.IInquiryRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.feign.UserRepository;
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
        return new InquirySaveDTO(1L, "user123", "123456789", "test@mail.com", "John", "Doe", "Consulta", "Descripción", List.of(1L));
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
        i.setEmail("test@mail.com");
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
        userDTO.setMail("test@mail.com");
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
    void createWithoutUser_success() {
        InquirySaveDTO dto = getSampleDTO();
        dto.setUserId(null);
        Property property = getSampleProperty();

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(propertyRepository.findAllById(List.of(1L))).thenReturn(List.of(property));

        ResponseEntity<String> response = inquiryService.createWithoutUser(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(emailService).sendEmailInquiry(any());
        verify(inquiryRepository).save(any());
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
    void updateStatus_success() {
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

        ResponseEntity<String> response = inquiryService.create(dto);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().contains("No se ha encontrado la propiedad"));
    }

    @Test
    void create_genericException() {
        InquirySaveDTO dto = getSampleDTO();

        when(propertyRepository.findById(1L)).thenThrow(new RuntimeException("Error inesperado"));

        ResponseEntity<String> response = inquiryService.create(dto);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testCreate_IllegalArgumentException() {
        InquirySaveDTO invalidDto = new InquirySaveDTO();
        invalidDto.setUserId(null);

        ResponseEntity<String> response = inquiryService.create(invalidDto);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testCreateWithoutUser_IllegalArgumentException() {
        InquirySaveDTO invalidDto = new InquirySaveDTO();
        invalidDto.setFirstName(null);

        ResponseEntity<String> response = inquiryService.createWithoutUser(invalidDto);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testGetByStatus_IllegalArgumentException() {
        InquiryStatus status = InquiryStatus.ABIERTA;

        when(inquiryRepository.getByStatus(status)).thenThrow(new IllegalArgumentException());

        ResponseEntity<List<Inquiry>> response = inquiryService.getByStatus(status);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testGetByStatus_DataIntegrityViolationException() {
        InquiryStatus status = InquiryStatus.ABIERTA;

        when(inquiryRepository.getByStatus(status)).thenThrow(new DataIntegrityViolationException(""));

        ResponseEntity<List<Inquiry>> response = inquiryService.getByStatus(status);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testGetByStatus_GeneralException() {
        InquiryStatus status = InquiryStatus.ABIERTA;

        when(inquiryRepository.getByStatus(status)).thenThrow(new RuntimeException());

        ResponseEntity<List<Inquiry>> response = inquiryService.getByStatus(status);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getById_notFound() {
        when(inquiryRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Inquiry> response = inquiryService.getById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testGetById_DataIntegrityViolationException() {
        Long id = 1L;

        when(inquiryRepository.findById(id)).thenThrow(DataIntegrityViolationException.class);

        ResponseEntity<Inquiry> response = inquiryService.getById(id);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testGetById_GeneralException() {
        Long id = 1L;

        when(inquiryRepository.findById(id)).thenThrow(RuntimeException.class);

        ResponseEntity<Inquiry> response = inquiryService.getById(id);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void updateStatus_notFound() {
        when(inquiryRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = inquiryService.updateStatus(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testUpdateStatus_DataIntegrityViolationException() {
        Long id = 1L;
        Inquiry inquiry = new Inquiry();
        inquiry.setId(id);

        when(inquiryRepository.findById(id)).thenReturn(Optional.of(inquiry));
        doThrow(DataIntegrityViolationException.class).when(inquiryRepository).save(any(Inquiry.class));

        ResponseEntity<String> response = inquiryService.updateStatus(id);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testUpdateStatus_GeneralException() {
        Long id = 1L;
        Inquiry inquiry = new Inquiry();
        inquiry.setId(id);

        when(inquiryRepository.findById(id)).thenReturn(Optional.of(inquiry));
        doThrow(RuntimeException.class).when(inquiryRepository).save(any(Inquiry.class));

        ResponseEntity<String> response = inquiryService.updateStatus(id);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getAll_dataIntegrityViolationException() {
        when(inquiryRepository.findAll())
                .thenThrow(new DataIntegrityViolationException("Error de integridad"));

        ResponseEntity<List<Inquiry>> response = inquiryService.getAll();

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getAll_generalException() {
        when(inquiryRepository.findAll())
                .thenThrow(new RuntimeException("Error inesperado"));

        ResponseEntity<List<Inquiry>> response = inquiryService.getAll();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getByUserId_userNotFound() {
        when(userRepository.exist("user123")).thenReturn(false);

        ResponseEntity<List<Inquiry>> response = inquiryService.getByUserId("user123");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getByUserId_dataIntegrityViolationException() {
        when(userRepository.exist("user123")).thenReturn(true);
        when(inquiryRepository.getByUserId("user123"))
                .thenThrow(new DataIntegrityViolationException("Error de integridad"));

        ResponseEntity<List<Inquiry>> response = inquiryService.getByUserId("user123");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getByUserId_generalException() {
        when(userRepository.exist("user123")).thenReturn(true);
        when(inquiryRepository.getByUserId("user123"))
                .thenThrow(new RuntimeException("Error inesperado"));

        ResponseEntity<List<Inquiry>> response = inquiryService.getByUserId("user123");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getByPropertyId_propertyNotFound() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<List<Inquiry>> response = inquiryService.getByPropertyId(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getByPropertyId_dataIntegrityViolationException() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(new Property()));
        when(inquiryRepository.getByPropertyId(1L))
                .thenThrow(new DataIntegrityViolationException("Error de integridad"));

        ResponseEntity<List<Inquiry>> response = inquiryService.getByPropertyId(1L);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getByPropertyId_generalException() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(new Property()));
        when(inquiryRepository.getByPropertyId(1L))
                .thenThrow(new RuntimeException("Error inesperado"));

        ResponseEntity<List<Inquiry>> response = inquiryService.getByPropertyId(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getByStatus_illegalArgumentException() {
        when(inquiryRepository.getByStatus(any()))
                .thenThrow(new IllegalArgumentException("Invalid status"));

        ResponseEntity<List<Inquiry>> response = inquiryService.getByStatus(InquiryStatus.ABIERTA);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getByStatus_dataIntegrityViolationException() {
        when(inquiryRepository.getByStatus(any()))
                .thenThrow(new DataIntegrityViolationException("Constraint error"));

        ResponseEntity<List<Inquiry>> response = inquiryService.getByStatus(InquiryStatus.CERRADA);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getByStatus_generalException() {
        when(inquiryRepository.getByStatus(any()))
                .thenThrow(new RuntimeException("Something went wrong"));

        ResponseEntity<List<Inquiry>> response = inquiryService.getByStatus(InquiryStatus.CERRADA);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getAverageInquiryResponseTime_error() {
        when(inquiryRepository.getByStatus(InquiryStatus.CERRADA))
                .thenThrow(new RuntimeException("Computation error"));

        ResponseEntity<String> response = inquiryService.getAverageInquiryResponseTime();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Error al calcular tiempo promedio", response.getBody());
    }

    @Test
    void getInquiryStatusDistribution_error() {
        when(inquiryRepository.countByStatus())
                .thenThrow(new RuntimeException("Unexpected error"));

        ResponseEntity<Map<String, Long>> response = inquiryService.getInquiryStatusDistribution();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(-1L, response.getBody().get("error"));
    }

    @Test
    void getInquiriesGroupedByDayOfWeek_error() {
        when(inquiryRepository.findAll()).thenThrow(new RuntimeException("DB Error"));

        ResponseEntity<Map<String, Long>> response = inquiryService.getInquiriesGroupedByDayOfWeek();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(-1L, response.getBody().get("error"));
    }

    @Test
    void getInquiriesGroupedByTimeRange_error() {
        when(inquiryRepository.findAll()).thenThrow(new RuntimeException("DB Error"));

        ResponseEntity<Map<String, Long>> response = inquiryService.getInquiriesGroupedByTimeRange();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(-1L, response.getBody().get("error"));
    }

    @Test
    void getInquiriesPerMonth_error() {
        when(inquiryRepository.countPerMonth()).thenThrow(new RuntimeException("DB Error"));

        ResponseEntity<Map<YearMonth, Long>> response = inquiryService.getInquiriesPerMonth();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getMostConsultedProperties_error() {
        when(inquiryRepository.countMostConsultedProperties())
                .thenThrow(new RuntimeException("DB failure"));

        ResponseEntity<Map<String, Long>> response = inquiryService.getMostConsultedProperties();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(-1L, response.getBody().get("error"));
    }
}
