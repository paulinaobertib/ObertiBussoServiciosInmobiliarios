package pi.ms_users.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pi.ms_users.domain.Favorite;
import pi.ms_users.service.interf.IFavoriteService;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/favorites")
public class FavoriteController {

    private final IFavoriteService favoriteService;

    @PreAuthorize("hasRole('user') and !hasRole('admin')")
    @PostMapping("/create")
    public ResponseEntity<Favorite> create(@RequestBody Favorite favorite) {
        return favoriteService.create(favorite);
    }

    @PreAuthorize("hasRole('user') and !hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return favoriteService.delete(id);
    }

    @PreAuthorize("hasAnyRole('admin', 'user')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Favorite>> getByUserId(@PathVariable String userId) {
        return favoriteService.findByUserId(userId);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/internal/allUser")
    public List<String> getAllUsers() {
        return favoriteService.findAllUsers();
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Favorite>> getByPropertyId(@PathVariable Long propertyId) {
        return favoriteService.findByPropertyId(propertyId);
    }
}
