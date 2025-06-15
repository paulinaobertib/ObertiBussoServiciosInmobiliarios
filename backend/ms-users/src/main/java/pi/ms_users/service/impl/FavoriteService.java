package pi.ms_users.service.impl;

import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.Favorite;
import pi.ms_users.domain.User;
import pi.ms_users.domain.feign.Property;
import pi.ms_users.repository.IFavoriteRepository;
import pi.ms_users.repository.UserRepository.IUserRepository;
import pi.ms_users.repository.feign.PropertyRepository;
import pi.ms_users.service.interf.IFavoriteService;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FavoriteService implements IFavoriteService {

    private final IFavoriteRepository favoriteRepository;

    private final IUserRepository userRepository;

    private final PropertyRepository propertyRepository;

    @Override
    public ResponseEntity<Favorite> create(Favorite favorite) {
        User user = userRepository.findById(favorite.getUserId())
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        Favorite saved = favoriteRepository.save(favorite);
        return ResponseEntity.ok(saved);
    }

    @Override
    public ResponseEntity<String> delete(Long id) {
        Favorite favorite = favoriteRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Favorito no encontrado"));
        favoriteRepository.delete(favorite);
        return ResponseEntity.ok("Se ha eliminado la propiedad de favoritos");
    }

    @Override
    public ResponseEntity<List<Favorite>> findByUserId(String userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"));

        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        return ResponseEntity.ok(favorites);
    }

    @Override
    public ResponseEntity<List<Favorite>> findByPropertyId(Long propertyId) {
        Property property = propertyRepository.getById(propertyId);
        List<Favorite> favorites = favoriteRepository.findByPropertyId(propertyId);
        return ResponseEntity.ok(favorites);
    }
}
