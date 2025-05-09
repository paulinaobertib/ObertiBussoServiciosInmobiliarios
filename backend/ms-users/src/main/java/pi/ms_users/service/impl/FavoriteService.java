package pi.ms_users.service.impl;

import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.Favorite;
import pi.ms_users.domain.User;
import pi.ms_users.repository.IFavoriteRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.service.interf.IFavoriteService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FavoriteService implements IFavoriteService {

    private final IFavoriteRepository favoriteRepository;

    private final IUserRepository userRepository;

    @Override
    public ResponseEntity<Favorite> create(Favorite favorite) {
        try {
            Optional<User> user = Optional.empty();
            try {
                user = userRepository.findById(favorite.getUserId());
            } catch (NotFoundException e) {
                return ResponseEntity.notFound().build();
            }

            Favorite saved = favoriteRepository.save(favorite);
            return ResponseEntity.ok(saved);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        try {
            Optional<Favorite> favorite = favoriteRepository.findById(id);
            if (favorite.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            favoriteRepository.delete(favorite.get());
            return ResponseEntity.ok("Se ha eliminado la propiedad de favoritos");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Favorite>> findByUserId(String userId) {
        try {
            Optional<User> user = Optional.empty();
            try {
                user = userRepository.findById(userId);
            } catch (NotFoundException e) {
                return ResponseEntity.notFound().build();
            }

            List<Favorite> favorites = favoriteRepository.findByUserId(userId);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<Favorite>> findByPropertyId(Long propertyId) {
        try {
            // verificar que la propiedad existe
            List<Favorite> favorites = favoriteRepository.findByPropertyId(propertyId);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
