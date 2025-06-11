package pi.ms_users.service.interf;

import org.springframework.http.ResponseEntity;
import pi.ms_users.domain.Favorite;

import java.util.List;

public interface IFavoriteService {
    ResponseEntity<?> create(Favorite favorite);

    ResponseEntity<?> delete(Long id);

    ResponseEntity<?> findByUserId(String userId);

    ResponseEntity<?> findByPropertyId(Long propertyId);
}