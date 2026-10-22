package pi.ms_users.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// numeracion correlativa por emisor y tipo (ej: "CORREDOR_RECIBO")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Receipt_Sequence")
public class ReceiptSequence {
    @Id
    @Column(name = "sequence_key", nullable = false, length = 50)
    private String sequenceKey;

    @Column(name = "last_number", nullable = false)
    private Long lastNumber;
}
