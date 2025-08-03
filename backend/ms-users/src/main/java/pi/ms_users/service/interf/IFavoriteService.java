package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Favorite;

import java.util.List;

public interface IFavoriteService {
    ResponseEntity<Favorite> create(Favorite favorite);

    ResponseEntity<String> delete(Long id);

    ResponseEntity<List<Favorite>> findByUserId(String userId);

    ResponseEntity<List<Favorite>> findByPropertyId(Long propertyId);

    List<String> findAllUsers();
}