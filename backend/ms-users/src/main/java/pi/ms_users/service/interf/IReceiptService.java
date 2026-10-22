package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.ReceiptIssuer;
import pi.ms_users.domain.ReceiptKind;
import pi.ms_users.domain.ReceiptStatus;
import pi.ms_users.dto.receipt.ReceiptDTO;
import pi.ms_users.dto.receipt.ReceiptGetDTO;

import java.time.LocalDate;
import java.util.List;

public interface IReceiptService {
    ResponseEntity<ReceiptGetDTO> create(ReceiptDTO dto);

    byte[] preview(ReceiptDTO dto);

    ResponseEntity<ReceiptGetDTO> getById(Long id);

    byte[] getPdf(Long id);

    String getFileName(Long id);

    ResponseEntity<List<ReceiptGetDTO>> search(ReceiptIssuer issuer, ReceiptKind kind, ReceiptStatus status, LocalDate from, LocalDate to, String q);

    ResponseEntity<List<ReceiptGetDTO>> getByContract(Long contractId);

    ResponseEntity<List<ReceiptGetDTO>> getMine();

    ResponseEntity<ReceiptGetDTO> annul(Long id, String reason);
}
