package pi.ms_properties.service.interf;

import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.InquiryStatus;
import pi.ms_properties.dto.InquirySaveDTO;

import java.util.List;

public interface IInquiryService {
    ResponseEntity<String> create(InquirySaveDTO inquirySaveDTO);

    ResponseEntity<String> createWithoutUser(InquirySaveDTO inquirySaveDTO);

    ResponseEntity<String> updateStatus(Long id);

    ResponseEntity<Inquiry> getById(Long id);

    ResponseEntity<List<Inquiry>> getAll();

    ResponseEntity<List<Inquiry>> getByUserId(String userId);

    ResponseEntity<List<Inquiry>> getByPropertyId(Long propertyId);

    ResponseEntity<List<Inquiry>> getByStatus(InquiryStatus status);
}
