package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.ChatMessage;

import java.util.List;

@Repository
public interface IChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("select cm from ChatMessage cm where cm.chatSession.id = ?1")
    List<ChatMessage> findBySession(Long sessionId);
}
