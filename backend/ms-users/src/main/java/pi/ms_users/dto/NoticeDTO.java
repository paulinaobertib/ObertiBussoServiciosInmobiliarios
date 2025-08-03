package pi.ms_users.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NoticeDTO {
    private Long id;
    private String userId;
    private LocalDateTime date;
    private String title;
    @JsonIgnore
    private MultipartFile mainImage;
    private String description;
}
