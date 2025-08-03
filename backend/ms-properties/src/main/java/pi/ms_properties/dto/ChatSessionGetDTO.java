package pi.ms_properties.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatSessionGetDTO {
    private Long id;
    private String userId;
    private String phone;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDateTime date;
    private LocalDateTime dateClose;
    private Long propertyId;
}
