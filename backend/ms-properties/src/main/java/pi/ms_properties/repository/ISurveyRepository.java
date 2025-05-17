package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.Survey;

import java.util.List;

@Repository
public interface ISurveyRepository extends JpaRepository<Survey, Long> {
    @Query("SELECT AVG(s.score) FROM Survey s")
    Float findAverageScore();

    @Query("SELECT s.score, COUNT(s) FROM Survey s GROUP BY s.score")
    List<Object[]> countScores();

    @Query("SELECT DATE(i.date), AVG(s.score) FROM Survey s JOIN s.inquiry i GROUP BY DATE(i.date)")
    List<Object[]> findDailyAverageScore();

    @Query("SELECT FUNCTION('DATE_FORMAT', i.date, '%Y-%m'), AVG(s.score) FROM Survey s JOIN s.inquiry i GROUP BY FUNCTION('DATE_FORMAT', i.date, '%Y-%m')")
    List<Object[]> findMonthlyAverageScore();

}
