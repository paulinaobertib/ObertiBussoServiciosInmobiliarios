package pi.ms_users.dto;

import lombok.Data;

import java.util.List;

@Data
public class GuarantorGetDTO {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private List<ContractGuarantorGetDTO> contractGetDTOS;
}
