package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_users.domain.ContractDocument;
import pi.ms_users.dto.contractpdf.ContractDocumentInfoDTO;
import pi.ms_users.dto.contractpdf.ContractExtraFieldDTO;
import pi.ms_users.dto.contractpdf.ContractExtractionDTO;

import java.util.List;

public interface IContractPdfService {
    ResponseEntity<ContractExtractionDTO> extract(MultipartFile file);

    ResponseEntity<ContractDocumentInfoDTO> saveDocument(Long contractId, MultipartFile file);

    ResponseEntity<ContractDocumentInfoDTO> getDocumentInfo(Long contractId);

    ContractDocument getDocument(Long contractId);

    ResponseEntity<String> deleteDocument(Long contractId);

    ResponseEntity<List<ContractExtraFieldDTO>> getExtraFields(Long contractId);

    ResponseEntity<List<ContractExtraFieldDTO>> replaceExtraFields(Long contractId, List<ContractExtraFieldDTO> fields);
}
