package pi.ms_users.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import pi.ms_users.domain.ReceiptSequence;

import java.util.Optional;

public interface IReceiptSequenceRepository extends JpaRepository<ReceiptSequence, String> {

    // bloquea la fila para que dos recibos simultaneos no tomen el mismo numero
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ReceiptSequence s WHERE s.sequenceKey = ?1")
    Optional<ReceiptSequence> findForUpdate(String key);
}
