package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.ChatDerivation;

import java.util.List;

@Repository
public interface IChatDerivationRepository extends JpaRepository<ChatDerivation, Long> {
    @Modifying
    @Query("DELETE FROM ChatDerivation cd WHERE cd.chatSession.id IN :sessionIds")
    void deleteAllBySessionIds(@Param("sessionIds") List<Long> sessionIds);
}