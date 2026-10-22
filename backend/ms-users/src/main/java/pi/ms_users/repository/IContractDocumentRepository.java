package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import pi.ms_users.domain.ContractDocument;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface IContractDocumentRepository extends JpaRepository<ContractDocument, Long> {

    Optional<ContractDocument> findByContractId(Long contractId);

    // sin el contenido, para mostrar "contrato adjunto" sin traer el PDF entero
    @Query("SELECT d.fileName AS fileName, d.sizeBytes AS sizeBytes, d.uploadedAt AS uploadedAt FROM ContractDocument d WHERE d.contractId = ?1")
    List<DocumentInfo> findInfoByContractId(Long contractId);

    @Modifying
    @Query("DELETE FROM ContractDocument d WHERE d.contractId = ?1")
    void deleteByContractId(Long contractId);

    interface DocumentInfo {
        String getFileName();

        Long getSizeBytes();

        LocalDateTime getUploadedAt();
    }
}
