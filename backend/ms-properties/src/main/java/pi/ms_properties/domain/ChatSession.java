package pi.ms_properties.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "chat_session")
public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = true)
    private String userId;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "date_close", nullable = true)
    private LocalDateTime dateClose;

    @Column(name = "derived", nullable = false)
    private Boolean derived;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    @JsonBackReference
    private Property property;

    @OneToMany(mappedBy = "chatSession", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private Set<ChatMessage> chatMessages = new HashSet<>();

    @OneToOne(mappedBy = "chatSession", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private ChatDerivation chatDerivation;
}
