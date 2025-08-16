package pi.ms_users.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Commission")
public class Commission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "currency", nullable = false)
    private PaymentCurrency currency;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "payment_type", nullable = false)
    private CommissionPaymentType paymentType;

    @Column(name = "installments", nullable = true)
    private Integer installments;

    @Column(name = "status", nullable = false)
    private CommissionStatus status;

    @Column(name = "note", nullable = true)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", foreignKey = @ForeignKey(name = "fk_commission_contract"))
    private Contract contract;

    @OneToMany(mappedBy = "commission", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Payment> payments = new ArrayList<>();
}
