package pi.ms_users.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "Contract_Utility_Increase")
public class ContractUtilityIncrease {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_utility_id", nullable = false, foreignKey = @ForeignKey(name = "fk_contract_utility_increase__contract_utility"))
    private ContractUtility contractUtility;

    @Column(name = "adjustment_date", nullable = false)
    private LocalDate adjustmentDate;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
}