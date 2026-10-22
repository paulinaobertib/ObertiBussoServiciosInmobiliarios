package pi.ms_users.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pi.ms_users.domain.Receipt;
import pi.ms_users.domain.ReceiptIssuer;
import pi.ms_users.domain.ReceiptKind;
import pi.ms_users.domain.ReceiptStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IReceiptRepository extends JpaRepository<Receipt, Long> {

    @EntityGraph(attributePaths = {"items"})
    Optional<Receipt> findWithItemsById(Long id);

    @EntityGraph(attributePaths = {"items"})
    @Query("SELECT DISTINCT r FROM Receipt r WHERE " +
            "(:issuer IS NULL OR r.issuer = :issuer) AND " +
            "(:kind IS NULL OR r.kind = :kind) AND " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:from IS NULL OR r.issueDate >= :from) AND " +
            "(:to IS NULL OR r.issueDate <= :to) AND " +
            "(:q IS NULL OR LOWER(r.payerName) LIKE :q OR LOWER(r.number) LIKE :q OR LOWER(r.propertyAddress) LIKE :q OR LOWER(r.ownerName) LIKE :q) " +
            "ORDER BY r.issueDate DESC, r.id DESC")
    List<Receipt> search(ReceiptIssuer issuer, ReceiptKind kind, ReceiptStatus status, LocalDate from, LocalDate to, String q);

    @EntityGraph(attributePaths = {"items"})
    @Query("SELECT DISTINCT r FROM Receipt r WHERE r.userId = ?1 AND r.status = pi.ms_users.domain.ReceiptStatus.EMITIDO ORDER BY r.issueDate DESC, r.id DESC")
    List<Receipt> findVisibleByUserId(String userId);

    @EntityGraph(attributePaths = {"items"})
    @Query("SELECT DISTINCT r FROM Receipt r WHERE r.contractId = ?1 ORDER BY r.issueDate DESC, r.id DESC")
    List<Receipt> findByContractId(Long contractId);

    @Query("SELECT r FROM Receipt r WHERE r.paymentId = ?1 AND r.status = pi.ms_users.domain.ReceiptStatus.EMITIDO")
    List<Receipt> findActiveByPaymentId(Long paymentId);
}
