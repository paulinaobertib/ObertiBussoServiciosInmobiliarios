package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
    void getById_notFound() {
        when(inquiryRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<Inquiry> response = inquiryService.getById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void updateStatus_notFound() {
        when(inquiryRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<String> response = inquiryService.updateStatus(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
