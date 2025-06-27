package pi.ms_properties.dto;

import lombok.Data;
import pi.ms_properties.domain.InquiryStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InquiryGetDTO {
    private Long id;
    private String userId;
    private String phone;
    private String email;
    private String firstName;
    private String lastName;
    private String title;
    private String description;
    private List<String> propertyTitles;
    private LocalDateTime date;
    private InquiryStatus status;
    private LocalDateTime dateClose;
}
