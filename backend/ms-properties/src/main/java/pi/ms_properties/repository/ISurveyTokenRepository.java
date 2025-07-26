package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.SurveyToken;

@Repository
public interface ISurveyTokenRepository extends JpaRepository<SurveyToken, Long> {
    @Query("select st from SurveyToken st where st.token = ?1")
    SurveyToken findByToken(String token);
}
