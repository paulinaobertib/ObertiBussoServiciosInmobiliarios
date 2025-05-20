package pi.ms_properties.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class InquirySaveDTO {
    private Long id;
    private String userId;
    private String phone;
    private String email;
    private String firstName;
    private String lastName;
    private String title;
    private String description;
    private List<Long> propertyIds;
}
