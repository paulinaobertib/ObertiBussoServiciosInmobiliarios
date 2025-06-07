package pi.ms_users.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.Favorite;

import java.util.List;

@Repository
public interface IFavoriteRepository extends JpaRepository<Favorite, Long> {
    @Query("select f from Favorite f where f.userId = ?1")
    List<Favorite> findByUserId(String userId);

    @Query("select f from Favorite f where f.propertyId = ?1")
    List<Favorite> findByPropertyId(Long propertyId);
}
