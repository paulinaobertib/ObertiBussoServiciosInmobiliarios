package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.Inquiry;
import pi.ms_properties.domain.Survey;

import java.util.List;

@Repository
public interface ISurveyRepository extends JpaRepository<Survey, Long> {
    @Query("SELECT COUNT(s) FROM Survey s WHERE s.inquiry.id = ?1")
    long countSurveysByInquiryId(Long inquiryId);

    @Query("SELECT AVG(s.score) FROM Survey s")
    Float findAverageScore();

    @Query("SELECT s.score, COUNT(s) FROM Survey s GROUP BY s.score")
    List<Object[]> countScores();

    @Query("SELECT FUNCTION('DAYOFWEEK', s.inquiry.date), AVG(s.score) FROM Survey s GROUP BY FUNCTION('DAYOFWEEK', s.inquiry.date)")
    List<Object[]> findAverageScoreGroupedByDayOfWeek();

    @Query("SELECT FUNCTION('DATE_FORMAT', i.date, '%Y-%m'), AVG(s.score) FROM Survey s JOIN s.inquiry i GROUP BY FUNCTION('DATE_FORMAT', i.date, '%Y-%m')")
    List<Object[]> findMonthlyAverageScore();
}
