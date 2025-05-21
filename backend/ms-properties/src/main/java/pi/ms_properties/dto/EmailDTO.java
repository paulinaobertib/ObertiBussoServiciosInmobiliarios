package pi.ms_properties.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EmailDTO {
    private String title;
    private String description;
    private LocalDateTime date;
    private String phone;
    private String email;
    private String firstName;
    private String lastName;
    private List<String> propertiesTitle;
}
