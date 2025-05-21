package pi.ms_properties.dto.feign;

import lombok.Data;

@Data
public class UserDTO {
    private String id;
    private String username;
    private String mail;
    private String firstName;
    private String lastName;
    private String phone;
}
