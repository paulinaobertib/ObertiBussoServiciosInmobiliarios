package pi.ms_users.dto;

import lombok.Data;

import java.util.List;

@Data
public class IncreaseIndexGetContractsDTO {
    private Long id;
    private String code;
    private String name;
    private List<ContractDTO> contractDTOList;
}
