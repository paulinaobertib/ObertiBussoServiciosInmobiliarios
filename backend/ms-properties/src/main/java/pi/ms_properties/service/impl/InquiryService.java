package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.InquiryStatus;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.EmailDTO;
import pi.ms_properties.dto.InquirySaveDTO;
import pi.ms_properties.dto.feign.UserDTO;
import pi.ms_properties.repository.IInquiryRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.feign.UserRepository;
import pi.ms_properties.service.interf.IInquiryService;

import java.time.*;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryService implements IInquiryService {

    private final IInquiryRepository inquiryRepository;

    private final IPropertyRepository propertyRepository;

    private final UserRepository userRepository;

    private final EmailService emailService;

    private final SurveyService surveyService;

    private Inquiry saveInquiry(InquirySaveDTO inquirySaveDTO) {
        List<Long> propertyIds = inquirySaveDTO.getPropertyIds();
        for (Long propertyIdFind : propertyIds) {
            Optional<Property> property = propertyRepository.findById(propertyIdFind);
            if (property.isEmpty()) {
                throw new IllegalArgumentException("No se ha encontrado la propiedad con id " + propertyIdFind);
            }
        }
        List<Property> properties = propertyRepository.findAllById(propertyIds);

        Inquiry inquiry = new Inquiry();
        inquiry.setDate(LocalDateTime.now());
        inquiry.setTitle(inquirySaveDTO.getTitle());
        inquiry.setDescription(inquirySaveDTO.getDescription());
        inquiry.setStatus(InquiryStatus.ABIERTA);
        inquiry.setProperties(properties);

        for (Property property : properties) {
            property.getInquiries().add(inquiry);
        }

        return inquiry;
    }

    private ResponseEntity<String> saveAndSendEmail(InquirySaveDTO inquirySaveDTO, Inquiry inquiry) {
        inquiryRepository.save(inquiry);

        List<Long> propertyIds = inquirySaveDTO.getPropertyIds();
        List<Property> properties = propertyRepository.findAllById(propertyIds);
        List<String> titles = properties.stream().map(Property::getTitle).collect(Collectors.toList());

        EmailDTO emailDTO = new EmailDTO();
        emailDTO.setFirstName(inquiry.getFirstName());
        emailDTO.setLastName(inquiry.getLastName());
        emailDTO.setEmail(inquiry.getEmail());
        emailDTO.setPhone(inquiry.getPhone());
        emailDTO.setDescription(inquiry.getDescription());
        emailDTO.setDate(inquiry.getDate());
        emailDTO.setPropertiesTitle(titles);

        emailService.sendEmailInquiry(emailDTO);

        return ResponseEntity.ok("Se ha creado la consulta");
    }

    @Override
    @Transactional
    public ResponseEntity<String> create(InquirySaveDTO inquirySaveDTO) {
        try {
            Inquiry inquiry = saveInquiry(inquirySaveDTO);

            Boolean existUser = userRepository.exist(inquirySaveDTO.getUserId());
            if (existUser) {
                UserDTO userDTO = userRepository.findById(inquirySaveDTO.getUserId());
                inquiry.setUserId(userDTO.getId());
                inquiry.setPhone(userDTO.getPhone());
                inquiry.setEmail(userDTO.getMail());
                inquiry.setFirstName(userDTO.getFirstName());
                inquiry.setLastName(userDTO.getLastName());
            }

            return saveAndSendEmail(inquirySaveDTO, inquiry);
        } catch (HttpMessageNotReadableException e) {
            return ResponseEntity.badRequest().body("El cuerpo del JSON no se pudo leer correctamente. Verificá el formato.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error en los datos enviados: " + e.getMessage());
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    @Transactional
    public ResponseEntity<String> createWithoutUser(InquirySaveDTO inquirySaveDTO) {
        try {
            Inquiry inquiry = saveInquiry(inquirySaveDTO);
            inquiry.setPhone(inquirySaveDTO.getPhone());
            inquiry.setEmail(inquirySaveDTO.getEmail());
            inquiry.setFirstName(inquirySaveDTO.getFirstName());
            inquiry.setLastName(inquirySaveDTO.getLastName());

            return saveAndSendEmail(inquirySaveDTO, inquiry);
        } catch (HttpMessageNotReadableException e) {
            return ResponseEntity.badRequest().body("El cuerpo del JSON no se pudo leer correctamente. Verificá el formato.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error en los datos enviados: " + e.getMessage());
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<String> updateStatus(Long id) {
        try {
            Optional<Inquiry> inquiry = inquiryRepository.findById(id);
            if (inquiry.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se ha encontrado la consulta");
            }

            Inquiry get = inquiry.get();
            get.setStatus(InquiryStatus.CERRADA);
            get.setDateClose(LocalDateTime.now());
            inquiryRepository.save(get);
            surveyService.sendSurvey(get.getEmail(), get.getId());
            return ResponseEntity.ok("Se ha actualizado el estado de la consulta");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<Inquiry> getById(Long id) {
        try {
            Optional<Inquiry> inquiry = inquiryRepository.findById(id);
            return inquiry.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Inquiry>> getAll() {
        try {
            List<Inquiry> inquiries = inquiryRepository.findAll();
            return ResponseEntity.ok(inquiries);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Inquiry>> getByUserId(String userId) {
        try {
            Boolean userExist = userRepository.exist(userId);
            if (!userExist) {
                return ResponseEntity.notFound().build();
            }
            List<Inquiry> inquiries = inquiryRepository.getByUserId(userId);
            return ResponseEntity.ok(inquiries);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Inquiry>> getByPropertyId(Long propertyId) {
        try {
            Optional<Property> property = propertyRepository.findById(propertyId);
            if (property.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            List<Inquiry> inquiries = inquiryRepository.getByPropertyId(propertyId);
            return ResponseEntity.ok(inquiries);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Inquiry>> getByStatus(InquiryStatus status) {
        try {
            List<Inquiry> inquiries = inquiryRepository.getByStatus(status);
            return ResponseEntity.ok(inquiries);
        } catch (IllegalArgumentException | DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
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

        long avgSeconds = durations.stream()
                .mapToLong(Duration::getSeconds)
                .sum() / durations.size();

        Duration avgDuration = Duration.ofSeconds(avgSeconds);
        long days = avgDuration.toDays();
        long hours = avgDuration.toHours() % 24;
        long minutes = avgDuration.toMinutes() % 60;
        long seconds = avgDuration.getSeconds() % 60;

        String readable = String.format("%d días, %d horas, %d minutos, %d segundos", days, hours, minutes, seconds);

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
                        e -> e.getKey().getDisplayName(TextStyle.FULL, new Locale("es", "ES")),
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
