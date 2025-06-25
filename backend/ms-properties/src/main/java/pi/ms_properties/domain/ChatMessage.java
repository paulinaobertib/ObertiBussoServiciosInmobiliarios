package pi.ms_properties.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Chat_Message")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chat_option")
    @Enumerated(EnumType.STRING)
    private ChatOption chatOption;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession chatSession;
}
