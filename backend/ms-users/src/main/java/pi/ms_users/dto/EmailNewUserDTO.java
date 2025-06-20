package pi.ms_users.dto;

import lombok.Data;

@Data
public class EmailNewUserDTO {
    private String from;
    private String to;
    private String title;
    private String firstName;
    private String userName;
    private String password;
}
