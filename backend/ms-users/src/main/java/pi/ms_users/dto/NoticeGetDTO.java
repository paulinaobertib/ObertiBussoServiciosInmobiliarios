package pi.ms_users.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoticeGetDTO {
    private Long id;
    private String userId;
    private LocalDateTime date;
    private String title;
    private String mainImage;
    private String description;
}
