package pi.ms_users.dto;

import lombok.Data;

import java.util.List;

@Data
public class UtilityGetContractsDTO {
    private Long id;
    private String name;
    private List<ContractDTO> contractDTOList;
}
