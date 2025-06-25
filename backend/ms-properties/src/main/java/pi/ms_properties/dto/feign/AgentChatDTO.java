package pi.ms_properties.dto.feign;

import lombok.Data;

@Data
public class AgentChatDTO {
    private Long id;
    private String userId;
    private Boolean enabled;
    private String name;
}
