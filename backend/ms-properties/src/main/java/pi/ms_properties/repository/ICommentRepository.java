package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.Comment;

import java.util.List;

@Repository
public interface ICommentRepository extends JpaRepository<Comment, Long> {
    @Query("select c from Comment c where c.property.id = ?1")
    // para cargar la relacion
    @EntityGraph(attributePaths = {"property"})
    List<Comment> findByPropertyId(Long propertyId);
}
