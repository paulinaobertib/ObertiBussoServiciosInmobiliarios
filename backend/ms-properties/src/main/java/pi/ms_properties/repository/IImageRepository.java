package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.Image;

import java.util.List;

@Repository
public interface IImageRepository extends JpaRepository<Image, Long> {
    @Query("select i from Image i where i.property.id = ?1")
    @EntityGraph(attributePaths = {"property"})
    List<Image> findAllByPropertyId(Long id);
}
