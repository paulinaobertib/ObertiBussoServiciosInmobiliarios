package pi.ms_users.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// datos del contrato que no tienen un campo propio (dia de pago, punitorios, destino, etc.)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "Contract_Extra_Field")
public class ContractExtraField {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "field_value", nullable = false, length = 2000)
    private String value;

    @Column(name = "item_order", nullable = false)
    private Integer position;
}
