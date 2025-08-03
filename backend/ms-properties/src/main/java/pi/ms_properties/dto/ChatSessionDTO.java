package pi.ms_properties.dto;

import lombok.Data;

@Data
public class ChatSessionDTO {
    private String userId;
    private String phone;
    private String email;
    private String firstName;
    private String lastName;
    private Long propertyId;
}
