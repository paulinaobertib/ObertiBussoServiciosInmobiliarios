package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.InquiryStatus;
import pi.ms_properties.dto.InquirySaveDTO;
import pi.ms_properties.service.interf.IInquiryService;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
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

    @PostMapping("/createWithoutUser")
    public ResponseEntity<String> createWithoutUser(@RequestBody InquirySaveDTO inquirySaveDTO) {
        return inquiryService.createWithoutUser(inquirySaveDTO);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @PutMapping("/status/{id}")
    public ResponseEntity<String> updateStatus(@PathVariable Long id) {
        return inquiryService.updateStatus(id);
    }

    // @PreAutAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<Inquiry> getById(@PathVariable Long id) {
        return inquiryService.getById(id);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<Inquiry>> getAll() {
        return inquiryService.getAll();
    }

    // @PreAutAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Inquiry>> getByUserId(@PathVariable String userId) {
        return inquiryService.getByUserId(userId);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Inquiry>> getByPropertyId(@PathVariable Long propertyId) {
        return inquiryService.getByPropertyId(propertyId);
    }

    // @PreAutAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getByStatus")
    public ResponseEntity<List<Inquiry>> getByStatus(@RequestParam InquiryStatus status) {
        return inquiryService.getByStatus(status);
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/statistics/duration")
    public ResponseEntity<String> getAverageInquiryResponseTime() {
        return inquiryService.getAverageInquiryResponseTime();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/statistics/status")
    public ResponseEntity<Map<String, Long>> getInquiryStatusDistribution() {
        return inquiryService.getInquiryStatusDistribution();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/statistics/week")
    public ResponseEntity<Map<String, Long>> getInquiriesGroupedByDayOfWeek() {
        return inquiryService.getInquiriesGroupedByDayOfWeek();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/statistics/time")
    public ResponseEntity<Map<String, Long>> getInquiriesGroupedByTimeRange() {
        return inquiryService.getInquiriesGroupedByTimeRange();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/statistics/month")
    public ResponseEntity<Map<YearMonth, Long>> getInquiriesPerMonth() {
        return inquiryService.getInquiriesPerMonth();
    }

    // @PreAutAuthorize("hasRole('admin')")
    @GetMapping("/statistics/properties")
    public ResponseEntity<Map<String, Long>> getMostConsultedProperties() {
        return inquiryService.getMostConsultedProperties();
    }
}

