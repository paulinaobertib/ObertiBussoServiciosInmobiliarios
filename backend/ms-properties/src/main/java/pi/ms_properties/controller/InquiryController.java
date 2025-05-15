package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.InquiryStatus;
import pi.ms_properties.dto.InquirySaveDTO;
import pi.ms_properties.service.interf.IInquiryService;

import java.util.List;

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

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/status/{id}")
    public ResponseEntity<String> updateStatus(@PathVariable Long id) {
        return inquiryService.updateStatus(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<Inquiry> getById(@PathVariable Long id) {
        return inquiryService.getById(id);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public ResponseEntity<List<Inquiry>> getAll() {
        return inquiryService.getAll();
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Inquiry>> getByUserId(@PathVariable String userId) {
        return inquiryService.getByUserId(userId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Inquiry>> getByPropertyId(@PathVariable Long propertyId) {
        return inquiryService.getByPropertyId(propertyId);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/getByStatus")
    public ResponseEntity<List<Inquiry>> getByStatus(@RequestParam InquiryStatus status) {
        return inquiryService.getByStatus(status);
    }
}

