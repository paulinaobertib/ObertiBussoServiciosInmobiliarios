package pi.ms_users.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Contract_Increase")
public class ContractIncrease {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    @Column(name = "currency", nullable = false)
    private PaymentCurrency currency;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "adjustment", nullable = false)
    private Integer adjustment;

    @Column(name = "note", nullable = true)
    private String note;

    @Column(name = "period_from", nullable = true)
    private LocalDateTime periodFrom;

    @Column(name = "period_to", nullable = true)
    private LocalDateTime periodTo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "index_id", nullable = false, foreignKey = @ForeignKey(name = "fk_contract_increase__index"))
    private IncreaseIndex index;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;
}
