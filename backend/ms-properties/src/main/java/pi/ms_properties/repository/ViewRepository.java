package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.View;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ViewRepository extends JpaRepository<View, Long> {
}
