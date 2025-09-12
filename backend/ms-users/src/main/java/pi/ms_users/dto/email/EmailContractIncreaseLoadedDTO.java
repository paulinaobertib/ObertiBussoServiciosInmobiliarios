package pi.ms_users.dto.email;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class EmailContractIncreaseLoadedDTO {
    private String to;
    private String firstName;
    private String lastName;
    private BigDecimal newAmount;
    private String currency;
    private Integer increase;
    private String index;
}