package pi.ms_properties.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SurveyDTO {
    private Long id;
    private int score;
    private String comment;
    private Long inquiryId;
}
