package pi.ms_users.dto.contractpdf;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContractDocumentInfoDTO {
    private String fileName;
    private Long sizeBytes;
    private LocalDateTime uploadedAt;
}
