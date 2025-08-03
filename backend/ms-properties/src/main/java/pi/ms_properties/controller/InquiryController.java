package pi.ms_properties.controller;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.InquiryStatus;
import pi.ms_properties.dto.InquiryGetDTO;
import pi.ms_properties.dto.InquirySaveDTO;
import pi.ms_properties.service.interf.IInquiryService;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final IInquiryService inquiryService;

    @PostMapping("/create")
    public ResponseEntity<String> create(@RequestBody InquirySaveDTO inquirySaveDTO) {
        return inquiryService.create(inquirySaveDTO);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/status/{id}")
    public ResponseEntity<String> updateStatus(@PathVariable Long id) throws MessagingException {
        return inquiryService.updateStatus(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<InquiryGetDTO> getById(@PathVariable Long id) {
        return inquiryService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<InquiryGetDTO>> getAll() {
        return inquiryService.getAll();
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InquiryGetDTO>> getByUserId(@PathVariable String userId) {
        return inquiryService.getByUserId(userId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<InquiryGetDTO>> getByPropertyId(@PathVariable Long propertyId) {
        return inquiryService.getByPropertyId(propertyId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getByStatus")
    public ResponseEntity<List<InquiryGetDTO>> getByStatus(@RequestParam InquiryStatus status) {
        return inquiryService.getByStatus(status);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/statistics/duration")
    public ResponseEntity<String> getAverageInquiryResponseTime() {
        return inquiryService.getAverageInquiryResponseTime();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/statistics/status")
    public ResponseEntity<Map<String, Long>> getInquiryStatusDistribution() {
        return inquiryService.getInquiryStatusDistribution();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/statistics/week")
    public ResponseEntity<Map<String, Long>> getInquiriesGroupedByDayOfWeek() {
        return inquiryService.getInquiriesGroupedByDayOfWeek();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/statistics/time")
    public ResponseEntity<Map<String, Long>> getInquiriesGroupedByTimeRange() {
        return inquiryService.getInquiriesGroupedByTimeRange();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/statistics/month")
    public ResponseEntity<Map<YearMonth, Long>> getInquiriesPerMonth() {
        return inquiryService.getInquiriesPerMonth();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/statistics/properties")
    public ResponseEntity<Map<String, Long>> getMostConsultedProperties() {
        return inquiryService.getMostConsultedProperties();
    }
}

