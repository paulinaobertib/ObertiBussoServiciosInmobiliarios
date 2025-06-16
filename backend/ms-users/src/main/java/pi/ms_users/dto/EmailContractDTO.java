package pi.ms_users.dto;

import lombok.Data;

@Data
public class EmailContractDTO {
    private String from;
    private String to;
    private String title;
    private String name;
}
