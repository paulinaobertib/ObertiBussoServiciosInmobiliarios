package pi.ms_users.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "agent_chat")
public class AgentChat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "user_id", nullable = false)
    private Boolean enabled = Boolean.FALSE;
}
