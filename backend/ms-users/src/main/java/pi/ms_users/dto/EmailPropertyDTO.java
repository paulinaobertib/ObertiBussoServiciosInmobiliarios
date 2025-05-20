package pi.ms_users.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EmailPropertyDTO {
    private String to;
    private LocalDateTime date;
    private String propertyImageUrl;
    private String propertyTitle;
    private String propertyLocation;
    private String propertyPrice;
    private String propertyDescription;
    private String propertyUrl;
    private String propertyCurrency;
    private String propertyOperation;
}
