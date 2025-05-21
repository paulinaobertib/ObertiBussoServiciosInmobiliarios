package pi.ms_properties.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Survey")
@Setter
public class Survey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "score", nullable = false)
    private int score;

    @Column(name = "comment", nullable = true)
    private String comment;

    @ManyToOne
    @JoinColumn(name = "inquiry_id", nullable = false)
    @JsonIgnoreProperties({"properties"})
    private Inquiry inquiry;
}
