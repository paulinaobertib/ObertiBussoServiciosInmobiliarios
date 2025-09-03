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
@Table(name = "Contract_Utility")
public class ContractUtility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "periodicity", nullable = false, length = 20)
    private UtilityPeriodicityPayment periodicity = UtilityPeriodicityPayment.MENSUAL;

    @Column(name = "initial_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal initialAmount = BigDecimal.ZERO;

    @Column(name = "last_paid_amount", precision = 15, scale = 2)
    private BigDecimal lastPaidAmount;

    @Column(name = "last_paid_date")
    private LocalDateTime lastPaidDate;

    @Column(name = "notes", length = 1000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", nullable = false, foreignKey = @ForeignKey(name = "fk_contract_utility__contract"))
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utility_id", nullable = false, foreignKey = @ForeignKey(name = "fk_contract_utility__utility"))
    private Utility utility;

    @OneToMany(mappedBy = "contractUtility")
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(mappedBy = "contractUtility", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ContractUtilityIncrease> increases = new ArrayList<>();
}
