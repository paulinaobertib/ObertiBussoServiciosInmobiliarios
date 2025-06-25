package pi.ms_properties.dto;

import lombok.Data;
import pi.ms_properties.domain.ChatOption;

import java.util.List;

@Data
public class EmailChatDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String propertyTitle;
    private List<String> chatOptions;
    private String agentName;
    private Boolean derived;
}
