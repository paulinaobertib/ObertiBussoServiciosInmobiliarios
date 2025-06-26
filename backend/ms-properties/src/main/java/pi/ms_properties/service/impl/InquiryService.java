package pi.ms_properties.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.MessagingException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.InquiryStatus;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.EmailDTO;
import pi.ms_properties.dto.InquiryGetDTO;
import pi.ms_properties.dto.InquirySaveDTO;
import pi.ms_properties.dto.feign.UserDTO;
import pi.ms_properties.repository.IInquiryRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.feign.UserRepository;
import pi.ms_properties.security.SecurityUtils;
import pi.ms_properties.service.interf.IInquiryService;

import java.time.*;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryService implements IInquiryService {

    private final IInquiryRepository inquiryRepository;

    private final IPropertyRepository propertyRepository;

    private final UserRepository userRepository;

    private final EmailService emailService;

    private final SurveyService surveyService;

    private final ObjectMapper objectMapper;

    private Inquiry saveInquiry(InquirySaveDTO inquirySaveDTO) {
        Inquiry inquiry = new Inquiry();
        inquiry.setDate(LocalDateTime.now());
        inquiry.setTitle(inquirySaveDTO.getTitle());
        inquiry.setDescription(inquirySaveDTO.getDescription());
        inquiry.setStatus(InquiryStatus.ABIERTA);

        if (inquirySaveDTO.getPropertyIds() != null && !inquirySaveDTO.getPropertyIds().isEmpty()) {
            List<Long> propertyIds = inquirySaveDTO.getPropertyIds();
            for (Long propertyIdFind : propertyIds) {
                Optional<Property> property = propertyRepository.findById(propertyIdFind);
                if (property.isEmpty()) {
                    throw new IllegalArgumentException("No se ha encontrado la propiedad con id " + propertyIdFind);
                }
            }

            List<Property> properties = propertyRepository.findAllById(propertyIds);
            inquiry.setProperties(properties);
            for (Property property : properties) {
                property.getInquiries().add(inquiry);
            }
        }

        return inquiry;
    }

    private ResponseEntity<String> saveAndSendEmail(InquirySaveDTO inquirySaveDTO, Inquiry inquiry) {
        inquiryRepository.save(inquiry);

        EmailDTO emailDTO = new EmailDTO();
        emailDTO.setFirstName(inquiry.getFirstName());
        emailDTO.setLastName(inquiry.getLastName());
        emailDTO.setEmail(inquiry.getEmail());
        emailDTO.setPhone(inquiry.getPhone());
        emailDTO.setDescription(inquiry.getDescription());
        emailDTO.setDate(inquiry.getDate());

        if (inquirySaveDTO.getPropertyIds() != null && !inquirySaveDTO.getPropertyIds().isEmpty()) {
            List<Long> propertyIds = inquirySaveDTO.getPropertyIds();
            List<Property> properties = propertyRepository.findAllById(propertyIds);
            List<String> titles = properties.stream().map(Property::getTitle).collect(Collectors.toList());
            emailDTO.setPropertiesTitle(titles);
        }

        emailService.sendEmailInquiry(emailDTO);

        return ResponseEntity.ok("Se ha creado la consulta");
    }

    @Override
    @Transactional
    public ResponseEntity<String> create(InquirySaveDTO inquirySaveDTO) {
        if (inquirySaveDTO.getUserId() != null && SecurityUtils.isUser() &&
                !inquirySaveDTO.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta acción.");
        }

        Inquiry inquiry = saveInquiry(inquirySaveDTO);

        if (inquirySaveDTO.getUserId() != null) {
            if (userRepository.exist(inquirySaveDTO.getUserId())) {
                UserDTO userDTO = userRepository.findById(inquirySaveDTO.getUserId());
                inquiry.setUserId(userDTO.getId());
                inquiry.setPhone(userDTO.getPhone());
                inquiry.setEmail(userDTO.getEmail());
                inquiry.setFirstName(userDTO.getFirstName());
                inquiry.setLastName(userDTO.getLastName());
            } else {
                throw new IllegalArgumentException("No existe el usuario con id " + inquirySaveDTO.getUserId());
            }
        } else {
            inquiry.setPhone(inquirySaveDTO.getPhone());
            inquiry.setEmail(inquirySaveDTO.getEmail());
            inquiry.setFirstName(inquirySaveDTO.getFirstName());
            inquiry.setLastName(inquirySaveDTO.getLastName());
        }

        return saveAndSendEmail(inquirySaveDTO, inquiry);
    }

    @Override
    public ResponseEntity<String> updateStatus(Long id) throws MessagingException {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado la consulta"));

        inquiry.setStatus(InquiryStatus.CERRADA);
        inquiry.setDateClose(LocalDateTime.now());
        inquiryRepository.save(inquiry);
        surveyService.sendSurvey(inquiry.getEmail(), inquiry.getId());

        return ResponseEntity.ok("Se ha actualizado el estado de la consulta");
    }

    @Override
    public ResponseEntity<InquiryGetDTO> getById(Long id) {
        Inquiry inquiry = inquiryRepository.findByIdWithProperties(id)
                .orElseThrow(() -> new EntityNotFoundException("Consulta no encontrada"));

        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !inquiry.getUserId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta acción.");
        }

        InquiryGetDTO inquiryGetDTO = objectMapper.convertValue(inquiry, InquiryGetDTO.class);
        inquiryGetDTO.setPropertyTitles(
                inquiry.getProperties().stream()
                        .map(Property::getTitle)
                        .collect(Collectors.toList())
        );

        return ResponseEntity.ok(inquiryGetDTO);
    }

    @Override
    public ResponseEntity<List<InquiryGetDTO>> getAll() {
        List<Inquiry> inquiries = inquiryRepository.findAllWithProperties();

        List<InquiryGetDTO> inquiryGetDTOS = inquiries.stream()
                .map(inquiry -> {
                    InquiryGetDTO dto = objectMapper.convertValue(inquiry, InquiryGetDTO.class);
                    dto.setPropertyTitles(
                            inquiry.getProperties().stream()
                                    .map(Property::getTitle)
                                    .collect(Collectors.toList())
                    );
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(inquiryGetDTOS);
    }

    @Override
    public ResponseEntity<List<Inquiry>> getByUserId(String userId) {
        if (!SecurityUtils.isAdmin() && SecurityUtils.isUser() &&
                !userId.equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("No tiene el permiso para realizar esta accion.");
        }

        if (!userRepository.exist(userId)) {
            throw new EntityNotFoundException("Usuario no encontrado");
        }

        List<Inquiry> inquiries = inquiryRepository.getByUserId(userId);
        return ResponseEntity.ok(inquiries);
    }

    @Override
    public ResponseEntity<List<Inquiry>> getByPropertyId(Long propertyId) {
        if (propertyRepository.findById(propertyId).isEmpty()) {
            throw new EntityNotFoundException("Propiedad no encontrada");
        }
        List<Inquiry> inquiries = inquiryRepository.getByPropertyId(propertyId);
        return ResponseEntity.ok(inquiries);
    }

    @Override
    public ResponseEntity<List<Inquiry>> getByStatus(InquiryStatus status) {
        return ResponseEntity.ok(inquiryRepository.getByStatus(status));
    }

    @Override
    public ResponseEntity<Map<String, Long>> getInquiryStatusDistribution() {
        List<Object[]> data = inquiryRepository.countByStatus();
        Map<String, Long> result = data.stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (Long) row[1]
                ));
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<String> getAverageInquiryResponseTime() {
        List<Duration> durations = inquiryRepository.getByStatus(InquiryStatus.CERRADA).stream()
                .filter(i -> i.getDateClose() != null)
                .map(i -> Duration.between(
                        i.getDate().atZone(ZoneId.systemDefault()).toInstant(),
                        i.getDateClose().atZone(ZoneId.systemDefault()).toInstant()
                ))
                .toList();

        if (durations.isEmpty()) return ResponseEntity.ok("0 segundos");

        long avgSeconds = durations.stream().mapToLong(Duration::getSeconds).sum() / durations.size();
        Duration avgDuration = Duration.ofSeconds(avgSeconds);

        String readable = String.format("%d días, %d horas, %d minutos, %d segundos",
                avgDuration.toDays(),
                avgDuration.toHours() % 24,
                avgDuration.toMinutes() % 60,
                avgDuration.getSeconds() % 60
        );

        return ResponseEntity.ok(readable);
    }

    @Override
    public ResponseEntity<Map<String, Long>> getInquiriesGroupedByDayOfWeek() {
        List<Inquiry> all = inquiryRepository.findAll();
        Map<DayOfWeek, Long> grouped = all.stream()
                .collect(Collectors.groupingBy(
                        i -> i.getDate().toLocalDate().getDayOfWeek(),
                        Collectors.counting()
                ));
        Map<String, Long> result = grouped.entrySet().stream()
                .collect(Collectors.toMap(
                        e -> e.getKey().getDisplayName(TextStyle.FULL, Locale.forLanguageTag("es-ES")),
                        Map.Entry::getValue
                ));
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, Long>> getInquiriesGroupedByTimeRange() {
        List<Inquiry> all = inquiryRepository.findAll();
        Map<String, Long> result = all.stream()
                .collect(Collectors.groupingBy(
                        i -> {
                            int hour = i.getDate().getHour();
                            if (hour < 12) return "Mañana";
                            if (hour < 18) return "Tarde";
                            return "Noche";
                        },
                        Collectors.counting()
                ));
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<YearMonth, Long>> getInquiriesPerMonth() {
        List<Object[]> data = inquiryRepository.countPerMonth();
        Map<YearMonth, Long> result = data.stream()
                .collect(Collectors.toMap(
                        row -> YearMonth.parse((String) row[0]),
                        row -> (Long) row[1]
                ));
        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, Long>> getMostConsultedProperties() {
        List<Object[]> data = inquiryRepository.countMostConsultedProperties();
        Map<String, Long> result = data.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).longValue()
                ));
        return ResponseEntity.ok(result);
    }
}
